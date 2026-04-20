# ZeroOne Portfolio Manager

This repository serves as the **Source of Truth** for the portfolio projects on [wp.zotech.xyz](https://wp.zotech.xyz/).

## 🚀 How to Add a New Project (Agentic Workflow)

We use an automated AI agent to keep our portfolio standard and professional. You don't need to write any code or Markdown manually!

1.  **Go to Issues:** Click on the [Issues](https://github.com/team-zeroone/zeroone-web-v6/issues) tab in this repository.
2.  **New Issue:** Click the green **New Issue** button.
3.  **Portfolio Project Template:** Choose the **New Portfolio Project** template.
4.  **Fill the Form:** Answer the questions. Don't worry about being perfect; just provide the raw details.
5.  **Submit:** Click **Submit new issue**.
6.  **Review the PR:** Within a minute, our AI agent will process your notes and open a **Pull Request**.
7.  **Approval:** Review the generated Markdown file in the PR. If it looks good, click **Merge Pull Request**.

Once merged, the project will be automatically synced to the WordPress site.

## 🔄 How to Update or Delete

### To Update
- **Option A (AI Help):** Go to the original **Issue** for the project, click **Edit**, modify your notes, and save. The agent will open a new PR with revised wording.
- **Option B (Manual):** Go into the `content/portfolio/` folder, open the specific `.md` file, and edit it directly using the GitHub pencil icon.

### To Delete
- Go to the `content/portfolio/` folder.
- Open the `.md` file for the project you wish to remove.
- Click the **...** menu and select **Delete file**, then commit the change.

---

## 🛠️ System Setup (For Admins)

### Gemini API Key
The workflow requires a Gemini API key to function.
1.  Obtain a key from [Google AI Studio](https://aistudio.google.com/).
2.  Add it to this repository's **Secrets**:
    - Settings -> Secrets and variables -> Actions
    - New repository secret
    - Name: `GEMINI_API_KEY`
    - Value: `YOUR_API_KEY`

### Local Development
If you need to work on the script locally:
```bash
npm install
# Set GEMINI_API_KEY environment variable
node scripts/process-portfolio.js
```
