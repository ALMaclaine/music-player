**Prompt for Commit Message Tool:**

**Input:**  
"Use Git CLI commands to determine the changed files and generate a Conventional Commit message. Follow these steps:**

1. **Get Changed Files:**
  - Use `git diff --name-only` to list the files that have been modified in the working directory.
  - If staging specific files, use `git diff --cached --name-only` to list staged files.

2. **Determine Change Type:**
  - Analyze the diff for each file using `git diff <file>` (or `git diff --cached <file>` for staged files) to understand the nature of the changes (e.g., feature addition, bug fix, refactoring, style changes).

3. **Generate Conventional Commit Message:**
  - Based on the analysis, decide on a Conventional Commit type: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, or `perf`.
  - Use the filename or directory as the scope if appropriate (e.g., `auth`, `api`, `ui`).
  - Create a concise summary of the changes (50 characters or less).
  - Include an optional body for more detailed context, referencing related issues or PRs if necessary.

**Format:**

<type>(<scope>): <short summary>

<body> ```
Example CLI Commands:

git diff --name-only
git diff <file>
Generate commit message based on the diffs.
Output: For each file or group of related files, generate a Conventional Commit message following the provided format.
