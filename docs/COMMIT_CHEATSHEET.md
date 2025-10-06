# Git Conventional Commit Types Cheatsheet

A reference guide for consistent, meaningful commit messages following conventional commit standards.

## Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Primary Commit Types

### `feat` - New Features
**Use when:** Adding new functionality or user-facing features
```bash
feat: add user profile dashboard
feat(auth): implement OAuth login with Google
feat: add search functionality to legislation database
```

### `fix` - Bug Fixes
**Use when:** Fixing bugs, errors, or broken functionality
```bash
fix: resolve navigation menu not displaying on mobile
fix(api): handle null values in database queries
fix: correct typo in contact form validation message
```

### `refactor` - Code Refactoring
**Use when:** Improving code structure without changing functionality
```bash
refactor: reorganize assets and improve file structure
refactor(components): extract reusable Button component
refactor: simplify authentication logic
```

### `docs` - Documentation
**Use when:** Adding or updating documentation
```bash
docs: add API documentation for user endpoints
docs: update README with installation instructions
docs(contributing): add code review guidelines
```

### `style` - Code Style
**Use when:** Formatting, whitespace, missing semicolons (no logic changes)
```bash
style: fix indentation in Navigation component
style: add missing semicolons
style: format code with Prettier
```

### `test` - Tests
**Use when:** Adding, updating, or fixing tests
```bash
test: add unit tests for user authentication
test(api): add integration tests for submission endpoints
test: fix failing tests after refactor
```

### `chore` - Maintenance
**Use when:** Updating build tools, dependencies, or maintenance tasks
```bash
chore: update dependencies to latest versions
chore(deps): bump react from 18.2.0 to 18.3.0
chore: configure ESLint rules
```

## Secondary Commit Types

### `perf` - Performance
**Use when:** Improving performance without changing functionality
```bash
perf: optimize database queries for faster loading
perf(images): compress logo files to reduce bundle size
```

### `ci` - Continuous Integration
**Use when:** Changes to CI/CD configuration files and scripts
```bash
ci: add GitHub Actions workflow for automated testing
ci: update deployment pipeline configuration
```

### `build` - Build System
**Use when:** Changes to build system or external dependencies
```bash
build: update webpack configuration
build(npm): add new scripts for development workflow
```

### `revert` - Revert Changes
**Use when:** Reverting a previous commit
```bash
revert: revert "feat: add experimental search feature"
```

## Breaking Changes

Add `!` after the type for breaking changes, or use `BREAKING CHANGE:` in footer:

```bash
feat!: remove deprecated API endpoints
feat(api): add new user management system

BREAKING CHANGE: The old /users endpoint has been removed.
Use /api/v2/users instead.
```

## Scopes (Optional)

Use scopes to specify which part of the codebase is affected:
- `feat(auth): add login functionality`
- `fix(database): resolve connection timeout issues`
- `docs(api): update endpoint documentation`

## Best Practices

### ✅ Good Examples
```bash
feat: add dark mode toggle to navigation
fix: resolve form validation error on submission
refactor: extract shared utility functions
docs: add troubleshooting section to README
```

### ❌ Avoid
```bash
feat: stuff
fix: things
update files
changed some code
```

## Quick Decision Tree

1. **Did I add new functionality?** → `feat`
2. **Did I fix a bug?** → `fix`
3. **Did I improve code without changing behavior?** → `refactor`
4. **Did I update documentation?** → `docs`
5. **Did I fix formatting/style only?** → `style`
6. **Did I add/update tests?** → `test`
7. **Did I update dependencies/build tools?** → `chore`
8. **Did I improve performance?** → `perf`

## Real-World Examples from This Project

```bash
feat: add admin moderation system with debug functionality
fix: resolve blank screen in submission wizard navigation
refactor: reorganize assets and improve file structure
docs: add branch protection setup guide
chore: update GitHub Actions workflow
test: add integration tests for submission flow
```

## References
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)