const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const slugify = require('slugify');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing');
    if (!githubToken) throw new Error('GITHUB_TOKEN is missing');

    const octokit = github.getOctokit(githubToken);
    const { owner, repo } = github.context.repo;
    const issuePayload = github.context.payload.issue;
    let issue;

    if (issuePayload) {
        issue = issuePayload;
    } else {
        const issueNumber = process.env.ISSUE_NUMBER;
        if (!issueNumber) throw new Error('No issue number provided for manual trigger');
        console.log(`Fetching issue #${issueNumber} from GitHub API...`);
        const { data: fetchedIssue } = await octokit.rest.issues.get({
            owner,
            repo,
            issue_number: parseInt(issueNumber)
        });
        issue = fetchedIssue;
    }

    if (!issue) throw new Error('Could not find issue context');

    console.log(`Processing issue: ${issue.title}`);

    // Parse issue body
    const body = issue.body;
    const data = parseIssueBody(body);

    // Use issue title as project title (stripping the template prefix)
    if (!data.title || data.title === '_No response_') {
        data.title = issue.title.replace(/^\[New Portfolio\]:\s*/i, '').trim();
    }

    // Default to a placeholder if thumbnail is missing
    if (!data.thumbnail || data.thumbnail === '_No response_') {
        data.thumbnail = 'https://ui.shadcn.com/placeholder.svg';
    }

    console.log('Parsed data:', JSON.stringify(data, null, 2));

    // ========================================
    // AI GENERATION (Optimized Pipeline)
    // ========================================

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const MODELS_TO_TRY = ['gemini-3.1-flash-lite-preview', 'gemini-2.5-flash'];
    const slug = slugify(data.title, { lower: true });

    // Optimization #4: Pre-fill frontmatter in code.
    const frontmatter = `---
title: "${data.title}"
slug: "${slug}"
type: "${data.type}"
date: "${new Date().toISOString()}"
excerpt: "{EXCERPT_PLACEHOLDER}"
image: "${data.thumbnail || ''}"
hero_image: "${data.hero_image || ''}"
stack: "${data.stack}"
source: "${data.source_url || ''}"
live: "${data.live_url || ''}"
---`;

    // Optimization #5: Enrich sparse details
    let enrichedDetails = data.details || '';
    if (!enrichedDetails || enrichedDetails.length < 50) {
        enrichedDetails = `Built with ${data.stack || 'modern technologies'}. ${enrichedDetails}`;
    }

    // Optimization #1: System prompt separated from user content
    // Optimization #2: Few-shot example included
    // Optimization #3: Strict output format
    const systemPrompt = `You are a content writer for ZeroOne, a creative technology agency.
Write professional, engaging portfolio project descriptions.
Tone: innovative, confident, sleek. Not salesy or generic.
Body length: 150-250 words.
Summary length: 15-25 words. One sharp sentence that captures the project's essence for a gallery card.
Never use the em-dash character. Use standard dashes (-), colons, or commas instead.
No preamble, no explanation, no code fences, no frontmatter.

You MUST follow this exact output format:
Line 1: EXCERPT: [your refined 15-25 word summary]
Line 2: blank
Line 3 onwards: the Markdown body, starting directly with your first subheading or paragraph. Do NOT include the project title.

Example input:
- Type: Tech
- Stack: React Native, Node.js, PostgreSQL
- Details: Built a real-time ride matching system for urban commuters. 50k+ users. Integrated Stripe payments and live GPS tracking.

Example output:
EXCERPT: A real-time ride-sharing platform connecting 50k+ urban commuters with drivers through intelligent geolocation matching.

### Smarter Commutes, One Tap Away
QuickRide reimagines urban transportation by connecting commuters with nearby drivers in real time. Built on React Native for seamless cross-platform performance, the app delivers sub-second ride matching powered by a custom geolocation engine.
...`;

    // Optimization #1 continued: User prompt is pure data, no instructions
    const userPrompt = `Write a portfolio description for this project:
- Title: ${data.title}
- Type: ${data.type}
- Stack: ${data.stack}
- Details: ${enrichedDetails}`;

    // Output validation: must contain EXCERPT: line and body starting with #
    function isValidOutput(text) {
        const trimmed = text.trim();
        return trimmed.startsWith('EXCERPT:') && trimmed.includes('\n#') && trimmed.length > 250;
    }

    // Parse EXCERPT: line from model output
    function parseOutput(text) {
        const lines = text.trim().split('\n');
        const excerptLine = lines[0];
        const excerpt = excerptLine.replace(/^EXCERPT:\s*/, '').trim();
        const body = lines.slice(1).join('\n').trim();
        return { excerpt, body };
    }

    let generatedBody = '';
    let refinedExcerpt = '';
    let successfulModel = '';

    for (const modelId of MODELS_TO_TRY) {
        try {
            console.log(`\n--- Attempting generation with ${modelId} ---`);
            const model = genAI.getGenerativeModel({
                model: modelId,
                systemInstruction: systemPrompt,
            });

            const maxRetries = 3;
            for (let i = 0; i < maxRetries; i++) {
                try {
                    console.log(`Attempt ${i + 1} of ${maxRetries}...`);
                    const result = await model.generateContent(userPrompt);
                    const response = await result.response;
                    let text = response.text();

                    // Post-processing: strip code fences and em-dashes
                    text = text.replace(/^```(?:markdown)?\n?/, '').replace(/\n?```$/, '');
                    text = text.split('\u2014').join('-');

                    // Validate before accepting
                    if (!isValidOutput(text)) {
                        console.warn(`Validation failed. Retrying...`);
                        if (i < maxRetries - 1) continue;
                        throw new Error('Model returned invalid output after all retries');
                    }

                    const parsed = parseOutput(text);
                    generatedBody = parsed.body;
                    refinedExcerpt = parsed.excerpt;
                    successfulModel = modelId;
                    break;
                } catch (err) {
                    if (i === maxRetries - 1) throw err;
                    const waitTime = Math.pow(2, i + 1) * 1000;
                    console.warn(`Gemini error (${modelId}): ${err.message}. Retrying in ${waitTime/1000}s...`);
                    await sleep(waitTime);
                }
            }
            if (generatedBody) {
                console.log(`Successfully generated content using ${modelId}`);
                break;
            }
        } catch (modelErr) {
            console.warn(`Model ${modelId} failed completely.`);
            if (modelId === MODELS_TO_TRY[MODELS_TO_TRY.length - 1]) {
                throw new Error(`All Gemini models in stack failed: ${modelErr.message}`);
            }
            console.log('Switching to fallback model...');
        }
    }

    // Assemble final file: use AI-refined excerpt in frontmatter
    const finalExcerpt = refinedExcerpt || 'A professional showcase by ZeroOne Technologies.';
    const finalFrontmatter = frontmatter.replace(
        '{EXCERPT_PLACEHOLDER}',
        finalExcerpt.replace(/"/g, '\\"')
    );
    console.log(`Refined excerpt: "${finalExcerpt}"`);

    const markdown = finalFrontmatter + '\n\n' + generatedBody.trim() + '\n';

    const filePath = `content/portfolio/${slug}.md`;
    
    // Check if it's a new project or an update
    const isUpdate = fs.existsSync(filePath);
    const actionLabel = isUpdate ? 'Update' : 'New';
    const actionSlug = isUpdate ? 'update' : 'add';

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, markdown);
    console.log(`Saved markdown to ${filePath}`);

    // Git operations for PR
    const branchName = `portfolio/${slug}-${Date.now()}`;
    
    core.setOutput('branch_name', branchName);
    core.setOutput('file_path', filePath);
    core.setOutput('project_title', data.title);
    core.setOutput('slug', slug);
    core.setOutput('action_label', actionLabel);
    core.setOutput('action_slug', actionSlug);
    core.setOutput('issue_number', issue.number.toString());
    core.setOutput('model_used', successfulModel);

  } catch (error) {
    core.setFailed(error.message);
  }
}

function parseIssueBody(body) {
  const data = {};
  const sections = body.split('###');
  
  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const header = lines[0].trim().toLowerCase();
    const content = lines.slice(1).join('\n').trim();
    
    if (header.includes('project title')) data.title = content;
    else if (header.includes('project type')) data.type = content;
    else if (header.includes('thumbnail')) {
        const match = content.match(/(?:!\[.*?\]\((.*?)\))|(http[^\s]+)/);
        if (match) {
            let url = match[1] || match[2];
            // Strip trailing junk characters (quotes, backslashes, brackets)
            data.thumbnail = url.replace(/["'\\\]\)]+$/, '');
        } else {
            data.thumbnail = content.trim();
        }
    }
    else if (header.includes('hero image')) {
        const match = content.match(/(?:!\[.*?\]\((.*?)\))|(http[^\s]+)/);
        if (match) {
            let url = match[1] || match[2];
            data.hero_image = url.replace(/["'\\\]\)]+$/, '');
        } else {
            data.hero_image = content.trim();
        }
    }
    else if (header.includes('full details')) data.details = content;
    else if (header.includes('tech stack')) data.stack = content;
    else if (header.includes('source url') || header.includes('github url')) data.source_url = content;
    else if (header.includes('live website url')) data.live_url = content;
  });

  return data;
}

run();
