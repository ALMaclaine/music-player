# Progress Tracking Methodology

This document outlines the steps for using the progress tracking system in our project development workflow.

## Steps:

1. **Read Current Progress**
   - At the start of each session, read the contents of the `progress.json` file.
   - Use the `progress_reader_prompt.md` to analyze and summarize the current progress.

2. **Understand Current State**
   - Based on the summary provided by the progress reader, identify:
     a. The current phase of the project
     b. Completed steps in the current phase
     c. The next pending step to work on

3. **Execute Current Step**
   - Work on the identified next pending step.
   - Document any actions taken or decisions made during this step.

4. **Update Progress**
   - After completing the current step:
     a. Update the `progress.json` file to reflect the completed step.
     b. Mark the step as "completed" in the JSON structure.
     c. If all steps in the current phase are completed, update the phase status and move to the next phase.

5. **Commit Changes**
   - After updating the `progress.json` file, commit the changes to version control.
   - Use a consistent commit message format, e.g., "Update progress: Completed [Step Name] in [Phase Name]"

6. **Prepare for Next Session**
   - Summarize the work done in the current session.
   - Identify the next steps to be taken in the following session.

## Using this Methodology:

1. Start each development session by following the steps outlined above.
2. Use the `progress_reader_prompt.md` to generate a summary of the current progress.
3. Always refer to the `progress.json` file for the most up-to-date project status.
4. Consistently update the progress after completing each step or phase.
5. End each session with a clear understanding of the next steps to be taken.

By following this methodology, we ensure that the project progress is accurately tracked, and any AI assistant or human developer can quickly understand the current state of the project and continue work from where it was left off.