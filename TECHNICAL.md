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

### Download Strategy (Double-Try)
When users drag and drop images into GitHub Issues, they are stored on GitHub's secure servers (e.g., `user-attachments`). Our sync script uses a resilient **Double-Try** download strategy:

1.  **Pass 1 (Anonymous):** Attempts to download the image without any token, using a browser-like `User-Agent` header. This works for most public assets.
2.  **Pass 2 (Authenticated):** If Pass 1 fails (403/404), the script retries using the `GITHUB_TOKEN` for authenticated access.
3.  **503 Retry:** Both passes include automatic retries with a 2-second delay if GitHub returns a `503 Service Unavailable`.

### Image Optimization
Before uploading to WordPress, images are automatically optimized using `sharp`:
-   **Resizing:** Images wider than 1200px are scaled down.
-   **Compression:** Converted to an optimized format, drastically reducing file size (e.g., 8MB → 350KB).
-   This prevents WordPress from timing out or crashing during thumbnail generation.

### Upload to WordPress
The optimized image is uploaded to the **WordPress Media Library** via the REST API and set as the post's **Featured Image** (`featured_media`). The upload step also includes retry logic for `503` errors from the hosting server.

---

## 🏗️ Architecture
| File | Purpose |
| :--- | :--- |
| `.github/ISSUE_TEMPLATE/portfolio-submission.yml` | The GUI Form for submitting new projects. |
| `.github/workflows/agent-portfolio.yml` | The AI Agent Pipeline (Issue → AI → PR). |
| `.github/workflows/sync-portfolio.yml` | The WordPress Sync Pipeline (Merge → WP). |
| `scripts/process-portfolio.js` | The AI Agent (Gemini content generation with tiered fallback). |
| `scripts/sync-wordpress.js` | The WordPress Syncer (markdown → REST API with image optimization). |
| `scripts/diagnose.js` | Diagnostic tool for troubleshooting connectivity and auth issues. |

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

---

## 🩺 Troubleshooting

If the WordPress sync fails (images not uploading, 503 errors, auth failures), use the built-in diagnostic tool:

```bash
node scripts/diagnose.js
```

This will run four checks in sequence:

| Step | What it Tests | Common Failures |
| :--- | :--- | :--- |
| 1 | WordPress REST API connectivity & auth | Invalid Application Password, wrong URL |
| 2 | Image download from GitHub | GitHub rate limits, private repos |
| 3 | Image optimization via Sharp | Corrupted image data, missing dependency |
| 4 | Media upload to WordPress | Insufficient user permissions, server timeout |

### Common Fixes

-   **`rest_not_logged_in`**: Your Application Password is invalid. Generate a new one in **WP Admin → Users → Your Profile → Application Passwords**.
-   **`503 Service Unavailable`**: Your hosting server is overloaded. Wait a few minutes and try again. The script has built-in retries.
-   **`socket hang up`**: The image is too large for your server. The `sharp` optimization should handle this automatically — ensure the `sharp` package is installed (`npm install`).
-   **LiteSpeed Auth Issue**: Ensure your `.htaccess` contains: `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]`
