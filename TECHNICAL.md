# Technical Documentation (Admins Only)

This document contains instructions for configuring and maintaining the Agentic Portfolio Workflow.

## 🛠️ System Setup

### Gemini API Key
The workflow requires a Gemini API key to function.
1.  Obtain a key from [Google AI Studio](https://aistudio.google.com/).
2.  Add it to this repository's **Secrets**:
    - Navigate to **Settings** -> **Secrets and variables** -> **Actions**
    - Click **New repository secret**
    - **Name:** `GEMINI_API_KEY`
    - **Value:** `YOUR_API_KEY`

### GitHub Settings
Ensure the workflow has the correct permissions:
- Go to **Settings** -> **Actions** -> **General**.
- Under **Workflow permissions**, select **Read and write permissions**.
- Check **Allow GitHub Actions to create and approve pull requests**.

---

## 💻 Local Development

If you need to work on the script or test it locally:

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/team-zeroone/zeroone-web-v6.git
    cd zeroone-web-v6
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Run the script:**
    Setting up a `.env` file makes local testing easier:
    - Copy `.env.example` to `.env`
    - Fill in your local/staging credentials.
    - Run the script (e.g., for a dry run):
    ```bash
    node scripts/sync-wordpress.js content/portfolio/lexigram.md --dry-run
    ```

---

## 🖼️ Image Handling & Security

### Authenticated Asset Sync
When users drag and drop images into GitHub Issues, they are stored on GitHub's secure servers (e.g., `user-attachments`). These URLs are private and will return 404 for anyone outside of GitHub.

To handle this, our Sync Script:
1. Uses the `GITHUB_TOKEN` to act as an authenticated user.
2. Formats a `GET` request with an `Authorization` header to download the private asset.
3. Automatically uploads the binary data to the **WordPress Media Library**.
4. Replaces the private GitHub URL in the WordPress post with the new, public WordPress URL.

This ensures images are stored securely during submission but are fully visible to the public once the project is "Published" on WordPress.

---

## 🏗️ Architecture
- **Issue Template:** `.github/ISSUE_TEMPLATE/portfolio-submission.yml` (The GUI Form)
- **Workflow:** `.github/workflows/agent-portfolio.yml` (The Pipeline)
- **Processor:** `scripts/process-portfolio.js` (The AI Agent)
- **Sync Tool:** `scripts/sync-wordpress.js` (The WordPress Connection)

---

## 📄 Markdown File Structure

If you are manually creating or editing files in `content/portfolio/`, they MUST follow this YAML frontmatter structure for the sync to work:

| Field | Purpose | Required |
| :--- | :--- | :--- |
| `title` | The project name shown in WordPress. | Yes |
| `slug` | The URL identifier (must be unique). | Yes |
| `type` | "Tech" or "Design". | Yes |
| `date` | ISO timestamp of the project. | Yes |
| `excerpt` | A short one-liner for grid cards. | Yes |
| `image` | Direct URL or GitHub attachment URL. | Yes |
| `stack` | Technologies used (comma separated). | No |
| `source` | Link to GitHub/Figma. | No |
| `live` | Link to the live website. | No |

**Example:**
```yaml
---
title: "Project Alpha"
slug: "project-alpha"
type: "Tech"
date: "2026-04-22T00:00:00Z"
excerpt: "A cool app built with React."
image: "https://example.com/thumb.png"
stack: "React, Firebase"
source: "https://github.com/user/repo"
live: "https://my-app.com"
---
```
---

## 👨‍💻 Developer Handover (Frontend)

If you are the developer building the frontend display for these projects, here is how you access the data:

### 1. Data Source
Projects are stored in the Custom Post Type: **`portfolio`**.

### 2. Custom Meta Fields
The automation script pushes data into the following standard WordPress Post Meta keys:
- `stack`: A comma-separated string of technologies (e.g., "React, Node.js").
- `source`: The URL to the GitHub or Figma source file.
- `live`: The URL to the live production website.

### 3. Images (Featured Image)
The script automatically downloads images from GitHub/External URLs and uploads them to the **WordPress Media Library**. It then sets them as the native **"Featured Image"** (`_thumbnail_id`) for each project. You can use `get_the_post_thumbnail_url()` or standard Elementor widgets to display them.

### 4. Querying via REST API
If you are building aheadless front end, you can fetch all projects at:
`GET /wp-json/wp/v2/portfolio?_embed`

### 5. Local Testing
To test the sync locally without affecting production:
1. Set the `WP_API_URL` to your local environment.
2. Run `node scripts/sync-wordpress.js --dry-run` to see the JSON payloads being sent without mutating the database.
