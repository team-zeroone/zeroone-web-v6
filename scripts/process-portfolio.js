const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const slugify = require('slugify');
const matter = require('gray-matter');

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
    
    if (data.title) {
        data.title = data.title.replace(/\[REGEN\]/gi, '').trim();
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
has_diagram: {DIAGRAM_PLACEHOLDER}
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

RULES:
1. Tone: "This platform empowers commuters by reducing friction..." (innovative, confident, sleek). Not salesy or generic.
2. Body length: 50-100 words. Focus strictly on the high-level business value, problem solved, and design philosophy. Do NOT include detailed technical/architecture breakdowns, as that will be shown in a separate diagram.
3. Summary length: 15-25 words. One sharp sentence that captures the project's essence for a gallery card.
4. Do NOT include the project title anywhere in your output.
5. Never use the em-dash character. Use standard dashes (-), colons, or commas instead.
6. No preamble, no explanation, no frontmatter.

You MUST follow this exact output format:
Line 1: EXCERPT: [your refined 15-25 word summary]
Line 2: blank
Line 3 onwards: the Markdown body, starting directly with your first subheading or paragraph.

Example input:
- Type: Tech
- Stack: React Native, Node.js, PostgreSQL
- Details: Built a real-time ride matching system for urban commuters. 50k+ users. Integrated Stripe payments and live GPS tracking.

Example output:
EXCERPT: A real-time ride-sharing platform connecting 50k+ urban commuters with drivers through intelligent geolocation matching.

### Smarter Commutes, One Tap Away
The platform reimagines urban transportation by connecting commuters with nearby drivers in real time. Built on React Native for seamless cross-platform performance, the app delivers sub-second ride matching powered by a custom geolocation engine. The design prioritizes a clean, frictionless interface, ensuring that users can request a ride instantly. By abstracting the complex backend logic, the platform provides a premium, zero-latency experience that redefines modern mobility.`;

    const mermaidSystemPrompt = `You are an expert software architect and technical communicator.
Generate a Mermaid.js diagram representing the architecture, data flow, or tech stack of the given project. Prefer data flow if clear, otherwise tech stack.
Rules:
1. ONLY output valid Mermaid code wrapped in a \`\`\`mermaid code block. No other text.
2. Use \`flowchart TD\` (Top-Down) instead of LR (Left-Right) to prevent the diagram from becoming excessively wide and hard to read. You can group nodes using subgraphs to keep it compact.
3. Keep it clean, professional, and visually balanced. Use concise labels.
4. DO NOT use parentheses or brackets inside node labels if it breaks Mermaid syntax.
5. Aim for 5-15 nodes max. If the stack is simple, 5-8 nodes is preferred. Don't make it overly complex.
6. BE EXTRA CAUTIOUS and STRICT: Only include technologies and components that are explicitly mentioned in the provided Stack or Details. Do not hallucinate or guess technologies. If unsure, stick to a high-level representation.
7. Node IDs must be alphanumeric with no spaces or special characters. Labels inside brackets may use spaces. Bad ID: api auth Good ID: apiAuth
8. If insufficient technical detail is provided, output a simple 3-node high-level flow: Input, System, Output.`;

    // Optimization #1 continued: User prompt is pure data, no instructions
    const userPrompt = `Write a portfolio description for this project:
- Title: ${data.title}
- Type: ${data.type}
- Stack: ${data.stack}
- Details: ${enrichedDetails}`;

    // Output validation: must contain EXCERPT: line and body starting with #
    function isValidOutput(text) {
        const trimmed = text.trim();
        return trimmed.startsWith('EXCERPT:') && trimmed.includes('\n#') && trimmed.length > 100;
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
    let generatedDiagram = '';
    let hasExistingDiagram = false;
    let successfulModel = 'skipped (existing file)';

    const filePath = `content/portfolio/${slug}.md`;
    const isUpdate = fs.existsSync(filePath);
    const forceRegen = issue.title.toLowerCase().includes('[regen]');

    if (isUpdate && !forceRegen) {
        console.log(`\n--- Existing project found at ${filePath} ---`);
        console.log(`Preserving existing content. To force re-generation, add '[REGEN]' to the issue title.`);
        const existingFile = fs.readFileSync(filePath, 'utf8');
        const { data: existingData, content: existingContent } = matter(existingFile);
        generatedBody = existingContent.trim();
        refinedExcerpt = existingData.excerpt;
        hasExistingDiagram = existingData.has_diagram === true || existingContent.includes('```mermaid');
    } else {
        if (forceRegen) console.log('\n--- Force Re-generation detected ([REGEN]) ---');
        
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

                    // Generate diagram
                    try {
                        console.log(`Generating Mermaid diagram with ${modelId}...`);
                        const diagramModel = genAI.getGenerativeModel({ model: modelId, systemInstruction: mermaidSystemPrompt });
                        const diagramResult = await diagramModel.generateContent(userPrompt);
                        const diagramText = diagramResult.response.text();
                        const mermaidInit = "%%{init: {'theme': 'default', 'themeVariables': { 'background': '#ffffff'}}}%%\n";
                        const match = diagramText.match(/```mermaid\n([\s\S]*?)```/);
                        if (match) {
                            generatedDiagram = "```mermaid\n" + mermaidInit + match[1].trim() + "\n```";
                            console.log('Successfully generated diagram.');
                        } else if (diagramText.includes('graph ') || diagramText.includes('flowchart ')) {
                            generatedDiagram = "```mermaid\n" + mermaidInit + diagramText.replace(/```mermaid/g, '').replace(/```/g, '').trim() + "\n```";
                            console.log('Successfully generated diagram (recovered).');
                        } else {
                            console.warn('Failed to parse Mermaid diagram from output.');
                        }
                    } catch (diagramErr) {
                         console.warn(`Failed to generate diagram: ${diagramErr.message}`);
                    }

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
                console.warn(`Model ${modelId} failed completely: ${modelErr.message}`);
                if (modelId === MODELS_TO_TRY[MODELS_TO_TRY.length - 1]) {
                    throw new Error(`All Gemini models in stack failed.`);
                }
                console.log('Switching to fallback model...');
            }
        }
    }

    // Assemble final file: use AI-refined excerpt in frontmatter
    const finalExcerpt = refinedExcerpt || 'A professional showcase by ZeroOne Technologies.';
    let finalFrontmatter = frontmatter.replace(
        '{EXCERPT_PLACEHOLDER}',
        finalExcerpt.replace(/"/g, '\\"')
    );
    const hasDiagramFinal = hasExistingDiagram || !!generatedDiagram;
    finalFrontmatter = finalFrontmatter.replace(
        '{DIAGRAM_PLACEHOLDER}',
        hasDiagramFinal ? 'true' : 'false'
    );
    console.log(`Refined excerpt: "${finalExcerpt}"`);

    let finalMarkdownBody = generatedBody.trim();
    if (generatedDiagram) {
         finalMarkdownBody = `### Architecture at a Glance\n\n${generatedDiagram}\n\n${finalMarkdownBody}`;
    }

    const markdown = finalFrontmatter + '\n\n' + finalMarkdownBody + '\n';

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
    let content = lines.slice(1).join('\n').trim();
    if (content === '_No response_') content = '';
    
    if (header.includes('project title')) data.title = content;
    else if (header.includes('project type')) {
        const matches = [...content.matchAll(/- \[[xX]\]\s*(.+)/g)];
        if (matches.length > 0) {
            data.type = matches.map(m => m[1].trim()).join(' & ');
        } else {
            data.type = content;
        }
    }
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
