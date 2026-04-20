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

## 🏗️ Architecture
- **Issue Template:** `.github/ISSUE_TEMPLATE/portfolio-submission.yml` (The GUI Form)
- **Workflow:** `.github/workflows/agent-portfolio.yml` (The Pipeline)
- **Processor:** `scripts/process-portfolio.js` (The AI Agent)
