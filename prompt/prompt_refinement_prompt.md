# Prompt Refinement Prompt

## Purpose
This prompt guides the process of refining and improving existing prompts based on feedback and experience. Use this prompt when you identify areas for improvement in existing prompts or receive feedback suggesting changes.

## Steps
1. Review the recent interactions and feedback related to the prompt in question.

2. Identify the main issues or areas for improvement, such as:
   - Clarity and conciseness
   - Alignment with project goals and workflows
   - Flexibility and adaptability
   - Efficiency in execution

3. For each identified issue, propose specific changes or refinements to address it.

4. Consider the following aspects when refining prompts:
   - Minimize redundancy and repetition
   - Ensure consistency with other prompts and project standards
   - Balance between providing necessary details and keeping the prompt concise
   - Anticipate potential misunderstandings or misinterpretations

5. If the refinement involves changes to multiple prompts or affects the overall workflow, consider the broader impact and ensure consistency across all affected areas.

6. Draft the refined version of the prompt, highlighting the changes made.

7. Explain the rationale behind each significant change, relating it to the identified issues and project goals.

8. Review the refined prompt for clarity, conciseness, and alignment with the project's needs.

9. If applicable, suggest any necessary updates to related documentation or other prompts to maintain consistency.

10. Recommend a plan for testing and validating the effectiveness of the refined prompt in real-world usage.

11. Update the prompt file with the refined version.

12. Update the prompt index (prompt/prompt_index.md) if necessary, ensuring the description and usage information are current.

## Example
Original prompt excerpt:
```markdown
4. Commit Changes:
   - Use git add to stage changes
   - Use git commit to commit changes
   - Push changes to remote repository
```

Refined prompt excerpt:
```markdown
4. Commit Changes:
   - Stage and commit changes in one step:
     ```
     git add . && git commit -m "type(scope): description of changes"
     ```
   - Ensure the commit message is descriptive and follows the conventional commit format
```

Rationale: This refinement combines two steps into one, reducing redundancy and improving efficiency. It also reinforces the use of conventional commit messages for consistency.