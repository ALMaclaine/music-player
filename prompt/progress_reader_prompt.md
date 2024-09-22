# Progress Reader Prompt

Your task is to analyze the contents of the progress.json file and provide a summary of the current project status and the next steps to be taken. Follow these steps:

1. Read the contents of the progress.json file.

2. Identify the current phase of the project by looking at the "current_phase" field.

3. For the current phase:
   a. Determine its status (in_progress, completed, or pending).
   b. List all steps within this phase and their respective statuses.

4. Identify the next pending step in the current phase. If all steps in the current phase are completed, identify the first pending step in the next phase.

5. Provide a summary that includes:
   a. The current phase of the project.
   b. A brief overview of completed steps in the current phase.
   c. The next pending step to be worked on.
   d. Any additional relevant information about the project's progress.

6. If all phases and steps are completed, indicate that the project is finished and suggest potential next actions (e.g., review, testing, or planning future enhancements).

Based on this analysis, formulate a clear and concise response that an AI assistant can use to understand the current state of the project and guide further development efforts.

Example response format:
"Current Phase: [Phase Name] ([Phase Status])
Completed Steps: [List of completed steps]
Next Step: [Next pending step]
Additional Info: [Any relevant details or observations]"

Remember to provide only factual information based on the contents of the progress.json file. Do not make assumptions or start working on the next step unless explicitly instructed to do so.