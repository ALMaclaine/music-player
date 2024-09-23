# Next Action Prompt

Use this prompt to determine the next action to take in the project based on the current progress.

1. Read the current `progress.json` file.

2. Identify the current phase and the next pending step.

3. Create a new branch for the task (refer to Git Workflow Prompt, step 1).

4. Update the `progress.json` file to add the new task as an in-progress item.

5. Commit the progress update (refer to Git Workflow Prompt, step 3).

6. Based on the pending step, determine the most appropriate action to take. This could include:
   - Creating a new file or directory
   - Modifying an existing file
   - Implementing a specific feature or functionality
   - Setting up a development environment or tool
   - Documenting a process or decision

7. Provide a clear, concise description of the next action to take, including:
   - The specific task to be performed
   - Any files or directories that will be affected
   - Any dependencies or prerequisites for this action

8. If there are multiple possible next actions, list them in order of priority.

9. If the next action requires any decisions to be made, clearly state the options and provide recommendations based on best practices and the project requirements.

10. After completing the task:
    - Commit your changes (refer to Git Workflow Prompt, step 3)
    - Merge the feature branch to master and delete the feature branch (refer to Git Workflow Prompt, step 5)
    - Update the `progress.json` file to reflect the completed task
    - Commit and push the progress update to master (refer to Git Workflow Prompt, step 3)

Remember to consider the overall project goals and maintain consistency with the existing project structure and coding standards when determining the next action.