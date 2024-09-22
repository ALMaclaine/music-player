**Streamlined Prompt for Commit Message Generation**

**Objective:** 
Generate a Conventional Commit message efficiently based on the current Git repository state.

**One-Step Analysis:**
Execute the following command to get a comprehensive view of changes:
```
git status --porcelain && echo "---" && git diff --staged && echo "---" && git diff
```

**Quick Commit Message Generation:**

1. **Determine Primary Change Type:**
   Choose one: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

2. **Identify Scope (optional):**
   Area of the codebase affected (e.g., `auth`, `ui`, `api`)

3. **Write Short Summary:**
   Concise description (50 chars or less)

4. **Add Body (if needed):**
   - List significant changes
   - Reference issues: "Fixes #123" or "Closes #456"
   - Note breaking changes: "BREAKING CHANGE: description"

**Commit Command:**
```
git commit -am "<type>(<scope>): <summary>

<body>"
```

**Example:**
```
git commit -am "feat(auth): implement OAuth2 login

- Add OAuth2 provider integration
- Update login UI
Closes #789"
```

**Note:** Adjust the commit command if new files need to be added (`git add` before committing).
