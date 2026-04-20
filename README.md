# ZeroOne Portfolio Manager

This repository serves as the **Source of Truth** for the portfolio projects on [wp.zotech.xyz](https://wp.zotech.xyz/).

## 🚀 How to Add a New Project

We use an automated AI agent to keep our portfolio standard and professional. You don't need to write any code or Markdown manually!

1.  **Go to Issues:** Click on the [Issues](https://github.com/team-zeroone/zeroone-web-v6/issues) tab in this repository.
2.  **New Issue:** Click the green **New Issue** button.
3.  **Portfolio Project Template:** Choose the **New Portfolio Project** template.
4.  **Add a Title:** Type the **Name of your Project** in the main "Add a title" box at the very top.
5.  **Fill the Form:** Answer the questions in the form. Don't worry about being perfect; just provide the raw details.
6.  **Submit:** Click **Submit new issue**.
7.  **Review the PR:** Within a minute, our AI agent will process your notes and open a **Pull Request**.
8.  **Approval:** Review the generated Markdown file in the PR. If it looks good, click **Merge Pull Request**.

Once merged, the project will be automatically synced to the WordPress site.

---

## 📄 Output Data Structure

When our AI Agent processes your issue, it creates a Markdown file that serves as the perfect "Source of Truth" for your WordPress site. 

The output is split into two critical sections:

### 1. The YAML Frontmatter
At the very top of the file, surrounded by `---`, is the metadata. This is structured data extracted directly from the form fields you filled out (Type, Excerpt, Live Links, Tech Stack, and Thumbnail Data). WordPress uses this structured data to populate the **Grid Cards** on the main portfolio listing page.

**Example:**
```yaml
---
title: "Lexigram"  # Automatically grabbed from your issue title.
slug: "lexigram"   # Converted into a URL-friendly lowercase string.
type: "Design"     # Grabbed exactly from the dropdown menu.
date: "2026-04-20T18:59:11.621Z" # Dynamically injected timestamp of creation!
excerpt: "Master French Vocabulary with AI" # Piped straight from the short-excerpt.
image: "https://images.pexels.com/..." # Read the thumbnail URL directly.
stack: "Figma, Flutter, FastAPI, Kafka" # Parsed the stack list.
source: "_No response_" # Blank if not provided. Link to Figma or GitHub.
live: "https://www.lexigram.ai/" # Read the live URL properly.
---
```

### 2. The Markdown Body
Below the frontmatter is the beautifully written article. The **Gemini AI** model takes your simple bullet points ("Brain Dump") and expands them into a professional, agency-quality narrative with proper headings, paragraphs, and formatting. When a user clicks your project card, WordPress displays this exact body segment as the full web page.

---

## 🔄 How to Update or Delete

### To Update
- **Option A (AI Help):** Go to the original **Issue** for the project, click **Edit**, modify your notes, and save. The agent will open a new PR with revised wording.
- **Option B (Manual):** Go into the `content/portfolio/` folder, open the specific `.md` file, and edit it directly using the GitHub pencil icon.

### To Delete
- Go to the `content/portfolio/` folder.
- Open the `.md` file for the project you wish to remove.
- Click the **...** menu and select **Delete file**, then commit the change.

---

## 💡 FAQ & Good to Know

- **Do I need to reopen a closed issue to update a project?**
  No! Even if a project issue was closed months ago, exactly matching the workflow, clicking **Edit** on the issue description and saving your changes will instantly wake up the AI Agent. It will open a brand new Pull Request to update the existing file.
  
- **What if I forget to add a Thumbnail URL?**
  The AI Agent is designed to be forgiving. If you skip the thumbnail, the Agent will automatically inject a sleek default placeholder image (`ui.shadcn.com/placeholder.svg`) so your web grid never breaks.

- **Can I edit the Markdown files manually?**
  Yes! If the AI Agent makes a tiny typo, you can navigate straight to `content/portfolio/` and use the GitHub pencil icon to fix the typo yourself. Just remember: if you ever edit the **original GitHub Issue** again in the future, the Agent will overwrite your manual file tweaks.

- **Why didn't my Pull Request generate?**
  Ensure that the **`portfolio`** label is attached to your issue. Our template adds it automatically, but if it gets removed, the AI Agent will intentionally skip the workflow to keep your repository clean.

---

## 🛠️ Administrative Information
For instructions on setting up the API keys, configuring workflow permissions, or local development, see [TECHNICAL.md](./TECHNICAL.md).
