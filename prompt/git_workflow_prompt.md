# Git Workflow Prompt

## Purpose
This prompt guides the process of managing git branches for each activity/task, making commits, and merging completed work back to the master branch.

## Steps

1. **Create and Switch to a New Branch**
   - Before starting a new task or activity, create and switch to a new branch:
     ```
     git checkout -b feature/[task-name]
     ```
   - Use a descriptive name for the branch, prefixed with "feature/" for new features or "bugfix/" for bug fixes.

2. **Work on the Task**
   - Make necessary changes and additions for the task.

3. **Commit Changes**
   - After completing the task or a significant part of it, stage and commit changes in one step:
     ```
     git add . && git commit -m "type(scope): description of changes

     - Bullet points for specific changes
     - Another specific change"
     ```
   - Ensure the commit message is descriptive and follows the conventional commit format.

4. **Complete the Task**
   - Ensure all work for the task is completed and committed.
   - Run tests if applicable to ensure everything is working as expected.

5. **Merge to Master and Clean Up**
   - Once the task is complete, perform the following actions in one step:
     ```
     git checkout master && git merge feature/[task-name] && git branch -d feature/[task-name]
     ```
   - This switches to master, merges the feature branch, and deletes it after a successful merge.
   - If there are merge conflicts, resolve them and commit the changes before proceeding.

6. **Push Changes**
   - Push the updated master branch to the remote repository:
     ```
     git push origin master
     ```

7. **Update Progress**
   - Update the progress.json file to reflect the completed task.
   - Commit and push the progress update to master.

Remember to use descriptive commit messages for each logical unit of work. This helps maintain a detailed and organized git history, making it easier to track progress and revert changes if necessary.

Note: This workflow assumes that merges can be performed without additional review. If a review process is needed, consider implementing a pull request workflow instead.