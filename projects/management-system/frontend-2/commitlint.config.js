/**
 * Commitlint Configuration
 *
 * Enforces Conventional Commits specification for frontend commits
 * https://www.conventionalcommits.org/
 */

module.exports = {
  extends: ["@commitlint/config-conventional"],

  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation changes
        "style", // Code style changes (formatting, missing semicolons, etc)
        "refactor", // Code refactoring
        "perf", // Performance improvements
        "test", // Adding or updating tests
        "build", // Build system or external dependencies
        "ci", // CI/CD configuration
        "chore", // Maintenance tasks
        "revert", // Revert previous commit
      ],
    ],

    // Subject validation
    "subject-case": [2, "never", ["upper-case"]], // No uppercase
    "subject-empty": [2, "never"], // Required
    "subject-full-stop": [2, "never", "."], // No period at end
    "subject-min-length": [2, "always", 3], // Min 3 characters

    // Type validation
    "type-case": [2, "always", "lower-case"], // Lowercase only
    "type-empty": [2, "never"], // Required

    // Scope validation (optional)
    "scope-case": [2, "always", "lower-case"], // Lowercase if provided

    // Body
    "body-leading-blank": [1, "always"], // Blank line before body
    "body-max-line-length": [2, "always", 100], // Max line length

    // Footer
    "footer-leading-blank": [1, "always"], // Blank line before footer
  },
};
