const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const slugify = require('slugify');

async function run() {
  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing');
    if (!githubToken) throw new Error('GITHUB_TOKEN is missing');

    const octokit = github.getOctokit(githubToken);
    const { owner, repo } = github.context.repo;
    const issue = github.context.payload.issue;

    if (!issue) throw new Error('No issue context found');

    console.log(`Processing issue: ${issue.title}`);

    // Parse issue body
    const body = issue.body;
    const data = parseIssueBody(body);

    console.log('Parsed data:', JSON.stringify(data, null, 2));

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert content writer for a creative agency called "ZeroOne". 
Your task is to take raw project notes and turn them into a professional, engaging portfolio piece.

Target language: English.
Tone: Professional, Innovative, Sleek.
Word count for description: ~150-250 words.

Raw Data:
- Title: ${data.title}
- Type: ${data.type}
- Thumbnail: ${data.thumbnail}
- Excerpt: ${data.excerpt}
- Tech Stack: ${data.stack}
- GitHub: ${data.github_url}
- Live Link: ${data.live_url}
- Brain Dump / Details: ${data.details}

Output Format:
You must return ONLY a Markdown file content. 
The Markdown must have YAML frontmatter.

Desired Frontmatter Structure:
---
title: "${data.title}"
slug: "${slugify(data.title, { lower: true })}"
type: "${data.type}"
date: "${new Date().toISOString()}"
excerpt: "${data.excerpt}"
image: "${data.thumbnail || ''}"
stack: "${data.stack}"
github: "${data.github_url || ''}"
live: "${data.live_url || ''}"
---

# ${data.title}

[Provide a structured, beautifully written description here based on the brain dump. Use headings if necessary.]
`;

    console.log('Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let markdown = response.text();

    // Clean up markdown if Gemini wrapped it in code blocks
    markdown = markdown.replace(/^```markdown\n/, '').replace(/\n```$/, '');

    const slug = slugify(data.title, { lower: true });
    const filePath = `content/portfolio/${slug}.md`;
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, markdown);
    console.log(`Saved markdown to ${filePath}`);

    // Git operations for PR
    const branchName = `portfolio/${slug}-${Date.now()}`;
    
    // Check out new branch
    // Note: In GitHub Actions, we often use git commands or octokit
    // For simplicity in this script, let's assume the workflow handling the PR creation
    // But the task says "Implement Pull Request Logic: Create a new branch, add the Markdown file..., commit it, and open a Pull Request."
    // So I will attempt to do it via Octokit if I can, or output the branch name for the next step.
    
    core.setOutput('branch_name', branchName);
    core.setOutput('file_path', filePath);
    core.setOutput('project_title', data.title);
    core.setOutput('slug', slug);

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
    else if (header.includes('thumbnail url')) data.thumbnail = content;
    else if (header.includes('short excerpt')) data.excerpt = content;
    else if (header.includes('full details')) data.details = content;
    else if (header.includes('tech stack')) data.stack = content;
    else if (header.includes('github url')) data.github_url = content;
    else if (header.includes('live website url')) data.live_url = content;
  });

  return data;
}

run();
