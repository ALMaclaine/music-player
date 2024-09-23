# Next Action Prompt

Use this prompt to determine the next action to take in the project based on the current progress.

1. Read the current `progress.json` file.

2. Identify the current phase and the next pending step.

3. Check if the next action involves creating or refining a prompt:
   - If creating a new prompt, use the create_prompt_prompt.md
   - If refining an existing prompt, use the prompt_refinement_prompt.md

4. If the action is not prompt-related, create a new branch for the task (refer to Git Workflow Prompt, step 1).

5. Update the `progress.json` file to add the new task as an in-progress item.

6. Commit the progress update (refer to Git Workflow Prompt, step 3).

7. Based on the pending step, determine the most appropriate action to take. This could include:
   - Creating a new file or directory
   - Modifying an existing file
   - Implementing a specific feature or functionality
   - Setting up a development environment or tool
   - Documenting a process or decision

8. Before proceeding, check if there are any relevant prompts for the specific action (e.g., code_implementation_prompt.md, testing_prompt.md, etc.) and follow them as appropriate.

9. Provide a clear, concise description of the next action to take, including:
   - The specific task to be performed
   - Any files or directories that will be affected
   - Any dependencies or prerequisites for this action

10. If there are multiple possible next actions, list them in order of priority.

11. If the next action requires any decisions to be made, clearly state the options and provide recommendations based on best practices and the project requirements.

12. After completing the task:
    - Commit your changes (refer to Git Workflow Prompt, step 3)
    - Merge the feature branch to master and delete the feature branch (refer to Git Workflow Prompt, step 5)
    - Update the `progress.json` file to reflect the completed task
    - Commit and push the progress update to master (refer to Git Workflow Prompt, step 3)

Remember to consider the overall project goals and maintain consistency with the existing project structure and coding standards when determining the next action. Always refer to and follow relevant prompts throughout the process.