# Contributing to use-form-history

First off, thank you for considering contributing to `use-form-history`! It's people like you that make the open source community such an amazing place to learn, inspire, and create.

We welcome all types of contributions:
- 🐛 **Bug Fixes**: Found a bug? Open an issue or fix it!
- ✨ **New Features**: Have an idea for a cool new feature? Let's discuss it.
- 📚 **Documentation**: Typos, unclear examples, or missing guides? Help us improve.
- 🧪 **Tests**: Help us increase our code coverage.

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **pnpm**: We use pnpm for dependency management.

### Installation

1.  **Fork** the repository on GitHub.
2.  **Clone** your fork locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/use-form-history.git
    cd use-form-history
    ```
3.  **Install dependencies**:
    ```bash
    pnpm install
    ```

## Development Workflow

We use [tsup](https://tsup.egoist.dev/) for bundling and [Vitest](https://vitest.dev/) for testing.

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Runs the build in watch mode. Useful for development. |
| `pnpm test` | Runs the test suite once. |
| `pnpm test:watch` | Runs tests in watch mode. |
| `pnpm build` | Builds the project for production (outputs to `dist/`). |
| `pnpm lint` | Runs ESLint to check for code style issues. |
| `pnpm typecheck` | Runs TypeScript type checking. |

## Project Structure

The codebase is organized into three main modules:

- **`src/core`**: The framework-agnostic logic (`HistoryManager`). This is the brain of the library.
- **`src/react`**: React hooks (`useFormHistory`, `useFieldHistory`, etc.) that wrap the core logic.
- **`src/vanilla`**: Vanilla JavaScript adapters (`createFormHistory`, `bindFormHistory`).

## Pull Request Process

1.  **Create a Branch**: Create a new branch for your feature or fix.
    ```bash
    git checkout -b feat/amazing-feature
    # or
    git checkout -b fix/annoying-bug
    ```
2.  **Make Changes**: Write your code and **add tests** for it. We aim for high test coverage!
3.  **Commit**: Please use [Conventional Commits](https://www.conventionalcommits.org/) for your commit messages.
    - `feat: add new jumpTo method`
    - `fix: resolve debounce issue in react hook`
    - `docs: update README examples`
4.  **Verify**: Run tests and linting before pushing.
    ```bash
    pnpm test
    pnpm lint
    ```
5.  **Push & PR**: Push to your fork and submit a Pull Request to the `main` branch.
    - Provide a clear description of what you changed and why.
    - Link to any relevant issues.

## Coding Standards

- **TypeScript**: We use TypeScript for everything. Please ensure your types are accurate and no `any` is used unless absolutely necessary.
- **Linting**: We use ESLint. If `pnpm lint` fails, please fix the issues.
- **Tests**: New features should have accompanying tests in the `tests/` directory.

## Community

If you have questions, feel free to start a [Discussion](https://github.com/muhammad4dev/use-form-history/discussions) or open an [Issue](https://github.com/muhammad4dev/use-form-history/issues).

Thank you for contributing! ❤️
