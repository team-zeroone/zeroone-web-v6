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

3.  **Run the script:**
    You will need to pass an issue body structure if you are testing manually, or mock the GitHub context.
    ```bash
    # Set GEMINI_API_KEY environment variable
    node scripts/process-portfolio.js
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
