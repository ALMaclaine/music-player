# Testing Prompt

## Purpose
This prompt guides the process of creating and executing tests for the project, ensuring code quality and functionality.

## Steps

1. **Identify Test Targets**
   - Determine which components, functions, or features need testing.
   - Prioritize based on complexity, recent changes, and critical functionality.

2. **Choose Test Type**
   - Decide on the appropriate test type (unit, integration, end-to-end, etc.).
   - Consider the testing pyramid: more unit tests, fewer integration and end-to-end tests.

3. **Set Up Test Environment**
   - Ensure necessary testing frameworks and tools are installed (e.g., Jest, React Testing Library).
   - Configure test scripts in package.json if not already set up.

4. **Write Test Cases**
   - Create descriptive test names using the "it should..." format.
   - Structure tests using the Arrange-Act-Assert pattern.
   - Cover both expected behavior and edge cases.

5. **Implement Tests**
   - Write the actual test code.
   - Use mocks or stubs for external dependencies when necessary.
   - Ensure tests are isolated and don't depend on each other.

6. **Run Tests**
   - Execute the tests using the appropriate command (e.g., `npm test`).
   - Analyze test results and fix any failures.

7. **Measure Code Coverage**
   - Use tools like Istanbul to measure code coverage.
   - Identify areas with low coverage and add more tests if necessary.

8. **Refactor and Optimize**
   - Look for opportunities to reduce duplication in test code.
   - Create helper functions or fixtures for common test setups.

9. **Document Testing Approach**
   - Update README or testing documentation with information on how to run tests.
   - Document any special considerations or setup required for testing.

10. **Integrate with CI/CD**
    - Ensure tests are run automatically on each commit or pull request.
    - Set up notifications for test failures in the CI/CD pipeline.

Remember to write tests that are maintainable, readable, and provide value in catching potential issues. Avoid testing implementation details and focus on testing behavior and outcomes.