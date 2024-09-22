# Progress Update Prompt

Use this prompt to guide the process of updating the project progress in the `progress.json` file.

1. Read the current `progress.json` file.

2. Identify the step or phase that needs to be updated.

3. Update the status of the identified step or phase:
   - For a step: Change its status to "completed" or "in_progress" as appropriate.
   - For a phase: Update its status to "completed" if all steps within are completed, or "in_progress" if some steps are still pending.

4. If moving to a new phase:
   - Set the "current_phase" field to the new phase number.
   - Update the status of the new phase to "in_progress".

5. If adding new steps to a phase:
   - Add the new step to the "steps" array of the appropriate phase.
   - Set the initial status of the new step to "pending".

6. After making changes, write the updated content back to the `progress.json` file.

7. Provide a summary of the changes made, including:
   - What was updated (step completed, phase changed, new step added, etc.)
   - The current phase and next pending step

8. Remind to commit the changes to version control with an appropriate commit message.

Example update summary:
"Updated 'Set Up Monorepo with Nx' step to 'completed'.
Current Phase: Project Setup & Planning (in_progress)
Next Step: Version Control & Collaboration"

Remember to only update based on actual progress made and to maintain the existing structure of the `progress.json` file.