**Improved Prompt for Commit Message Tool:**

**Objective:** 
Generate a Conventional Commit message based on the current state of the Git repository.

**Steps:**

1. **Assess Repository State:**
   - Use `git status --porcelain` to get a comprehensive view of the repository state.
   - This will show modified, added, deleted, and untracked files.

2. **Analyze Changes:**
   - For modified files: `git diff <file>`
   - For staged files: `git diff --cached <file>`
   - For new files: Consider their purpose in the project.
   - For deleted files: Consider the reason for deletion.

3. **Categorize Changes:**
   - Group related changes (e.g., all UI-related changes, all bug fixes).
   - Determine the primary type of change: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, or `perf`.

4. **Generate Conventional Commit Message:**
   - Format: `<type>(<scope>): <short summary>`
   - Type: Choose the most appropriate type based on the primary change.
   - Scope: Use the affected area of the codebase (e.g., `auth`, `ui`, `api`).
   - Summary: Write a concise description (50 characters or less).
   - Body: Add details if necessary, using bullet points for multiple changes.

5. **Handle Special Cases:**
   - For breaking changes, add `BREAKING CHANGE:` in the commit body.
   - For addressing specific issues, use `Fixes #123` or `Closes #456` in the commit body.

**Format Example:**
```
feat(auth): implement OAuth2 login

- Add OAuth2 provider integration
- Create user authentication middleware
- Update login UI to support new flow

Closes #789
```

**Example CLI Commands:**
```
git status --porcelain
git diff file1.js file2.js
git diff --cached file3.js
```

**Output:** 
Generate a single Conventional Commit message that encompasses all relevant changes. If changes are too diverse for a single commit, suggest splitting into multiple commits.

**Note:** Always consider the project's specific guidelines and conventions when creating commit messages.
