# Git Workflow Prompt

## Purpose
This prompt guides the process of managing git branches for each activity/task, making micro-commits, and merging completed work back to the master branch.

## Steps

1. **Create a New Branch**
   - Before starting a new task or activity, create a new branch:
     ```
     git checkout -b feature/task-name
     ```
   - Use a descriptive name for the branch, prefixed with "feature/" for new features or "bugfix/" for bug fixes.

2. **Work on the Task**
   - Make necessary changes and additions for the task.
   - For longer tasks, break down the work into smaller, logical units.

3. **Make Micro-Commits**
   - Commit changes frequently, ideally after each small, logical unit of work:
     ```
     git add <relevant files>
     git commit -m "type(scope): description of small change"
     ```
   - Ensure each micro-commit has a meaningful commit message.

4. **Complete the Task**
   - Ensure all work for the task is completed and committed.
   - Run tests if applicable to ensure everything is working as expected.

5. **Merge to Master**
   - Switch to the master branch:
     ```
     git checkout master
     ```
   - Merge the feature branch into master:
     ```
     git merge feature/task-name
     ```
   - Resolve any merge conflicts if they occur.

6. **Push Changes**
   - Push the updated master branch to the remote repository:
     ```
     git push origin master
     ```

7. **Clean Up**
   - Delete the local feature branch:
     ```
     git branch -d feature/task-name
     ```

8. **Update Progress**
   - Update the progress.json file to reflect the completed task.
   - Commit and push the progress update to master.

Remember to use micro-commits for each small, logical unit of work within a task. This helps maintain a detailed and organized git history, making it easier to track progress and revert changes if necessary.