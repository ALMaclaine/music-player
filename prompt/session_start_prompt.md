# Session Start Prompt

## Purpose
This prompt is designed to be run at the beginning of each new chat session to quickly bring the AI up to speed on the current state of the project and prepare for the next steps.

## Steps

1. **Review Project Progress**
   - Read the contents of the `progress.json` file to understand the current phase and completed steps.
   - Summarize the current state of the project based on this information.

2. **Check Recent Changes**
   - Run `git log -n 5 --oneline` to view the last 5 commits.
   - Briefly summarize the recent changes to the project.

3. **Review Prompt Index**
   - Read the `prompt/prompt_index.md` file to refresh on available prompts.

4. **Identify Next Actions**
   - Based on the current progress and recent changes, identify potential next steps.
   - If unclear, suggest using the `next_action_prompt.md` for more detailed guidance.

5. **Environment Check**
   - Review the list of open files and visible directories in the IDE.
   - Note any relevant configuration files or important project files that are currently open.

6. **Summarize and Prepare**
   - Provide a brief summary of the project state, recent changes, and potential next steps.
   - Ask if there are any specific tasks or areas to focus on in this session.

## Example Summary

"Project is currently in the [Phase Name] phase. Recent work includes [summary of recent commits]. Based on our progress, potential next steps could be [list potential steps]. The IDE currently has [list of important open files] open. Is there a specific area you'd like to focus on in this session?"

Remember to use this prompt at the start of each new chat session to ensure continuity and efficient progress in the project development.