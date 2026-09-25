# Contributing to AI Engineering Team

First off, thank you for considering contributing to AI Engineering Team! It's people like you that make this project such a great tool.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [Style Guides](#style-guides)
6. [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps which reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed after following the steps
- Explain which behavior you expected to see instead and why
- Include screenshots and animated GIFs if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Provide specific examples to demonstrate the steps
- Describe the current behavior and explain the behavior you expected to see
- Explain why this enhancement would be useful

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Follow the TypeScript styleguide
- Include screenshots in the pull request when possible
- End all files with a newline

## Getting Started

### Prerequisites

- Node.js 24.15.0 (see `.nvmrc`)
- npm 11+ (use the committed `package-lock.json`)
- Git

### Setup

1. Fork the repo
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-engineering-team.git
   cd ai-engineering-team
   ```

3. Install dependencies:

   ```bash
   npm ci
   ```

4. Create a branch:

   ```bash
   git checkout -b my-feature
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Project Structure

```
ai-engineering-team/
├── src/
│   ├── engine/          # Core AI engine
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── store/          # State management
│   ├── persistence/    # Data persistence
│   ├── analytics/      # Analytics engine
│   ├── sandbox/        # Code execution sandbox
│   └── filesystem/     # File system operations
├── docs/               # Documentation
└── public/             # Static assets
```

### Key Technologies

- **React** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **IndexedDB** - Data persistence
- **Groq API** - AI model provider
- **Web Workers** - Isolated code execution
- **Tailwind CSS** - Styling

### Coding Standards

#### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Use type aliases for unions and complex types

#### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop typing
- Follow React best practices

#### State Management

- Use Zustand for global state
- Keep state minimal and normalized
- Use selectors for derived state

#### File Naming

- Use PascalCase for components: `MyComponent.tsx`
- Use camelCase for utilities: `myUtility.ts`
- Use kebab-case for styles: `my-styles.css`

### Testing

Before submitting a PR, make sure:

- All tests pass: `npm test -- --run` (or `npm run test:ci` for coverage)
- No linting errors: `npm run lint`
- Build succeeds: `npm run build`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:

```
feat(engine): add support for OpenAI provider

fix(ui): resolve rendering issue in command center

docs(readme): update installation instructions
```

## Style Guides

### TypeScript Style Guide

- Use `const` and `let`, avoid `var`
- Use template literals instead of string concatenation
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Prefer arrow functions for callbacks
- Use async/await over raw promises

### React Style Guide

- Use functional components
- Use hooks for state and side effects
- Keep components pure when possible
- Use proper key props in lists
- Avoid inline styles (use Tailwind classes)

### CSS/Tailwind Style Guide

- Use Tailwind utility classes
- Follow mobile-first approach
- Use semantic class names when needed
- Keep custom CSS minimal

## Community

- Follow us on Twitter [@aiengteam](https://twitter.com/aiengteam)
- Join our [Discord server](https://discord.gg/aiengteam)
- Read our [blog](https://blog.aiengteam.com)

## Questions?

Feel free to contact us:

- Open an issue on GitHub
- Email: team@aiengteam.com
- Discord: [Join our server](https://discord.gg/aiengteam)

---

Thank you for contributing! 🚀
