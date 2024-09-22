# Git Workflow Prompt

## Purpose
This prompt guides the process of managing git branches for each activity/task, committing work to the appropriate branch, and merging completed work back to the master branch.

## Steps

1. **Create a New Branch**
   - Before starting a new task or activity, create a new branch:
     ```
     git checkout -b feature/task-name
     ```
   - Use a descriptive name for the branch, prefixed with "feature/" for new features or "bugfix/" for bug fixes.

2. **Work on the Task**
   - Make necessary changes and additions for the task.
   - Commit changes frequently with meaningful commit messages.

3. **Commit Changes**
   - Stage changes:
     ```
     git add .
     ```
   - Commit changes using the commit-work prompt:
     ```
     git commit -m "type(scope): description"
     ```

4. **Push Branch to Remote**
   - Push the branch to the remote repository:
     ```
     git push -u origin feature/task-name
     ```

5. **Complete the Task**
   - Ensure all work for the task is completed and committed.
   - Run tests if applicable to ensure everything is working as expected.

6. **Merge to Master**
   - Switch to the master branch:
     ```
     git checkout master
     ```
   - Pull the latest changes from the remote master:
     ```
     git pull origin master
     ```
   - Merge the feature branch into master:
     ```
     git merge feature/task-name
     ```
   - Resolve any merge conflicts if they occur.

7. **Push Master to Remote**
   - Push the updated master branch to the remote repository:
     ```
     git push origin master
     ```

8. **Clean Up**
   - Delete the local feature branch:
     ```
     git branch -d feature/task-name
     ```
   - Delete the remote feature branch if necessary:
     ```
     git push origin --delete feature/task-name
     ```

9. **Update Progress**
   - Update the progress.json file to reflect the completed task.
   - Commit and push the progress update to master.

Remember to use this workflow for each distinct task or activity in the project. This helps maintain a clean and organized git history, and makes it easier to track and manage different features or bug fixes.