# ZeroOne Portfolio Manager

This repository serves as the **Source of Truth** for the portfolio projects on [zotech.xyz](https://zotech.xyz/).

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
At the very top of the file, surrounded by `---`, is the metadata. This is structured data extracted directly from the form fields you filled out (Type, Live Links, Tech Stack, and Thumbnail Data). WordPress uses this structured data to populate the **Grid Cards** on the main portfolio listing page.

**Example:**
```yaml
---
title: "Project Alpha"  # Automatically grabbed from your issue title.
slug: "project-alpha"   # Converted into a URL-friendly lowercase string.
type: "Tech & Design"   # Selected via checkboxes. Can be "Tech", "Design", or "Tech & Design".
date: "2026-04-20T18:59:11.621Z" # Injected by the AI Agent based on submission time.
excerpt: "A sophisticated design system built for scale." # Refined automatically by AI from your Brain Dump.
image: "https://images.pexels.com/..." # Thumbnail. Downloaded and synced to WP Media.
hero_image: "https://images.pexels.com/..." # Optional header image for the project page.
stack: "Figma, Node.js" # Parsed the stack list.
source: "https://figma.com/..." # Project file link (GitHub, Figma, Dribbble, etc.).
live: "https://example.com/project-alpha" # Live website URL.
---
```

### 2. The Markdown Body
Below the frontmatter is the beautifully written article. The **Gemini AI** model takes your simple bullet points ("Brain Dump") and expands them into a professional, agency-quality narrative with proper headings, paragraphs, and formatting. When a user clicks your project card, WordPress displays this exact body segment as the full web page.

---

## 🔄 How to Update or Delete

### To Update
- **Option A (Safe Metadata Update):** Go to the original **Issue** for the project, click **Edit**, modify your metadata (like URLs or Stack), and save. The agent will open a new PR. **Your existing Markdown description will be preserved safely.**
- **Option B (Force AI Re-generation):** If you added a lot of new notes and want the AI to completely rewrite the project description, add **`[REGEN]`** anywhere in the Issue title before saving.
- **Option C (Manual):** Go into the `content/portfolio/` folder, open the specific `.md` file, and edit it directly using the GitHub pencil icon.

### To Delete
- Go to the `content/portfolio/` folder.
- Open the `.md` file for the project you wish to remove.
- Click the **...** menu and select **Delete file**, then commit the change.
- The sync workflow will automatically **trash the corresponding post and permanently delete its associated media files** (thumbnail & hero image) on the WordPress site. No manual cleanup needed.

#### Force Delete (Manual Cleanup)
If a project was already deleted from the repo but still exists on WordPress (e.g., the sync didn't run properly), you can manually trigger a cleanup:

1. Go to the **Actions** tab → select **WordPress Sync** from the sidebar.
2. Click **Run workflow**.
3. In the **"force_delete"** input, enter the slug(s) of the project(s) to remove, separated by spaces (e.g., `studyq coachello lift`).
4. Click **Run workflow**. The script will find and trash the matching WordPress posts and their media.

---

## 💡 FAQ & Good to Know

- **Do I need to reopen a closed issue to update a project?**
  No! Even if a project issue was closed months ago, exactly matching the workflow, clicking **Edit** on the issue description and saving your changes will instantly wake up the AI Agent. It will open a brand new Pull Request to update the existing file.
  
- **What if I forget to add a Thumbnail URL?**
  The AI Agent is designed to be forgiving. If you skip the thumbnail, the Agent will automatically inject a sleek default placeholder image (`ui.shadcn.com/placeholder.svg`) so your web grid never breaks.

- **Can I edit the Markdown files manually?**
  Yes! If the AI Agent makes a tiny typo, you can navigate straight to `content/portfolio/` and use the GitHub pencil icon to fix the typo yourself. Because of our "Safe Update" logic, if you later edit the GitHub Issue to change a URL, the Agent will **not** overwrite your manual tweaks to the text (unless you use the `[REGEN]` tag).

- **Why didn't my Pull Request generate?**
  Ensure that the **`portfolio`** label is attached to your issue. Our template adds it automatically, but if it gets removed, the AI Agent will intentionally skip the workflow to keep your repository clean.

---

## 🩺 Something Not Working?

If images aren't syncing or you see errors in GitHub Actions, run the built-in diagnostic tool locally:

```bash
npm install
node scripts/diagnose.js
```

This will test your API connection, image downloads, and WordPress uploads step-by-step. For full details, see [TECHNICAL.md](./TECHNICAL.md#-troubleshooting).

---

## 🛠️ Administrative Information
For instructions on setting up the API keys, configuring workflow permissions, or local development, see [TECHNICAL.md](./TECHNICAL.md).
