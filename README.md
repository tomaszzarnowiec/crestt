# App

Lightweight employee management panel built with Angular. The app lets you browse, search, and maintain a catalogue of employees in a clean UI.

## Key features

- Browse a sortable table of employees with evidence number, name, and gender.
- Filter the list on-the-fly by typing an employee's first or last name.
- Add new employees or edit existing entries in a modal form with validation.
- Remove employees directly from the list with instant feedback.
- Mock data layer backed by `@ngrx/signals`, making it easy to replace with a real API later.

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```
3. Visit `http://localhost:4200/` to use the application. The page refreshes automatically after file changes.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```
