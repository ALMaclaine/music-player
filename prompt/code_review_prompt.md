# Code Review and Refactoring Prompt

Use this prompt when reviewing existing code or considering refactoring opportunities.

1. Specify the file or component being reviewed.

2. Analyze the code for the following aspects:
   - Functionality: Does the code correctly implement the intended feature?
   - Readability: Is the code easy to understand? Are variable and function names clear?
   - Efficiency: Are there any performance bottlenecks or unnecessary computations?
   - Maintainability: Is the code modular and easy to modify or extend?
   - Error handling: Are potential errors and edge cases properly handled?
   - Consistency: Does the code follow project conventions and coding standards?

3. Identify any code smells or anti-patterns, such as:
   - Duplicate code
   - Long methods or functions
   - Excessive complexity
   - Tight coupling between components
   - Inconsistent naming conventions

4. For each issue identified, suggest improvements or refactoring strategies:
   - Explain the problem and why it's an issue
   - Propose a solution or refactoring approach
   - Describe the benefits of the proposed change

5. Consider the following refactoring techniques when appropriate:
   - Extract Method/Component
   - Rename Variable/Function
   - Introduce Parameter Object
   - Replace Conditional with Polymorphism
   - Simplify Complex Expressions

6. Assess the potential impact of suggested changes:
   - Will the changes affect other parts of the codebase?
   - Are there any potential risks or side effects?

7. Prioritize the suggested improvements:
   - High priority: Issues that affect functionality or performance
   - Medium priority: Code quality and maintainability improvements
   - Low priority: Minor stylistic changes

8. If implementing the suggested changes, follow the code implementation prompt and update any relevant documentation.

Remember that the goal of code review and refactoring is to improve the overall quality, maintainability, and efficiency of the codebase while preserving its functionality.