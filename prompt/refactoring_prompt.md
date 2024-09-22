# Refactoring Prompt

## Purpose
This prompt guides the process of identifying and executing code refactoring to improve code quality, maintainability, and performance without changing its external behavior.

## Steps

1. **Identify Refactoring Opportunities**
   - Look for code smells (e.g., duplicated code, long methods, complex conditional logic).
   - Use static analysis tools to identify potential issues.
   - Consider feedback from code reviews or performance profiling.

2. **Prioritize Refactoring Tasks**
   - Assess the impact and effort required for each refactoring opportunity.
   - Prioritize based on potential improvements in readability, maintainability, or performance.
   - Consider project deadlines and the risk of introducing bugs.

3. **Plan the Refactoring**
   - Clearly define the goal of the refactoring.
   - Outline the steps needed to complete the refactoring.
   - Identify any potential risks or side effects.

4. **Ensure Adequate Test Coverage**
   - Verify that the code to be refactored has sufficient test coverage.
   - If necessary, write additional tests before refactoring to catch any unintended changes in behavior.

5. **Perform the Refactoring**
   - Apply appropriate refactoring techniques (e.g., extract method, rename variable, move method).
   - Make small, incremental changes rather than large-scale modifications.
   - Use IDE refactoring tools when available to reduce the risk of errors.

6. **Run Tests**
   - Execute the test suite after each significant change.
   - Ensure all tests pass and no new bugs have been introduced.

7. **Review the Refactored Code**
   - Manually review the changes to ensure they meet the intended goals.
   - Verify that the code adheres to project coding standards and best practices.

8. **Update Documentation**
   - Update any affected documentation, including inline comments and external docs.
   - Clearly communicate the nature and reason for the refactoring in commit messages.

9. **Performance Verification**
   - If the refactoring was aimed at improving performance, conduct benchmarks to verify the improvement.

10. **Commit and Push Changes**
    - Make atomic commits with clear, descriptive messages.
    - Push changes and create a pull request if required by the project workflow.

11. **Monitor for Unintended Consequences**
    - Keep an eye on the refactored code in production for any unexpected issues.
    - Be prepared to quickly address any problems that arise from the refactoring.

Remember, the goal of refactoring is to improve the internal structure of the code without changing its external behavior. Always prioritize maintaining correct functionality throughout the refactoring process.