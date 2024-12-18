GATIKA Technology Documentation

Table of Contents

[1\. Introduction 2](#_Toc183623753)

[2\. Architecture Overview 2](#_Toc183623754)

[2.1. High-Level Architecture 2](#_Toc183623755)

[2.2. Key Modules and Their Roles 3](#_Toc183623756)

[2.2.1. Components 3](#_Toc183623757)

[2.2.2. Features 3](#_Toc183623758)

[2.2.3. Lib 3](#_Toc183623759)

[2.2.4. Routes 4](#_Toc183623760)

[2.3. State Management 4](#_Toc183623761)

[2.4. Data Flow 4](#_Toc183623762)

[2.5. Technology Stack 4](#_Toc183623763)

[2.6. Advantages of the Architecture 4](#_Toc183623764)

[3\. Key Technologies 5](#_Toc183623765)

[3.1. SolidJS for Reactive Frontend Development 5](#_Toc183623766)

[3.2. State Persistence with LocalStorage 5](#_Toc183623767)

[3.3. Dynamic Styling with StylexJS 5](#_Toc183623768)

[3.4. Development Enviroment 5](#_Toc183623769)

[3.5. Collaboration Workflow 5](#_Toc183623770)

[4\. Module Interactions and Integration 5](#_Toc183623771)

[4.1. Interaction Between Modules 6](#_Toc183623772)

[4.2. Examples of Integration 6](#_Toc183623773)

[4.2.1. Task Creation and Visualization 6](#_Toc183623774)

[4.2.2. Notifications in Action 6](#_Toc183623775)

[4.3. Benefits of Modular Integration 6](#_Toc183623776)

[5\. Testing 7](#_Toc183623777)

[5.1. Testing Strategy 7](#_Toc183623778)

[5.2. Tools Used 7](#_Toc183623779)

[5.3. Unit Testing 7](#_Toc183623780)

[5.4. End-to-End Testing 7](#_Toc183623781)

[5.5. Continuous Integration 8](#_Toc183623782)

[5.6. Advantages of the Testing Approach 8](#_Toc183623783)

[6\. Known Issues and Future Improvements 8](#_Toc183623784)

[7\. Project Setup (for inexperienced developers) 8](#_Toc183623785)

[7.1. System Requirements 8](#_Toc183623786)

[7.2. Installation Instructions 9](#_Toc183623787)

[7.3. Project Commands 9](#_Toc183623788)

[7.4. Troubleshooting 9](#_Toc183623789)

# Introduction

The Gatika project is a proof-of-concept Gantt chart application designed for
visualizing and managing tasks in infrastructure projects. Developed as part of
a university course, Gatika serves as a demo application for demonstrating task
organization, dependency tracking, and critical path visualization. The primary
goal is to provide a visually intuitive, minimalist tool that simplifies project
planning and management.

This documentation aims to provide future developers and contributors with a
detailed understanding of Gatika's technical structure, design decisions, and
implementation. It is intended for those who may maintain, extend, or build upon
the application after the course. The original intended end users of the
application are engineers managing infrastructure projects, for whom the demo is
designed to be simple, accessible, and efficient.

The scope of the project encompasses core functionalities such as creating,
editing, and removing tasks and projects, along with visualizing them in a Gantt
chart format. The application also highlights the critical path of project
activities, ensuring users can efficiently organize and manage tasks. As a demo,
it is browser-compatible and hosted in a lightweight environment. However, the
project operates under constraints, including a limited development timeframe, a
focus on a minimalist design.

By combining a clean user interface with robust functionality, Gatika showcases
the potential for further development into a fully integrated tool. This
documentation is structured to guide future developers through the codebase,
design decisions, and implementation details, enabling them to contribute
effectively.

# Architecture Overview

The architecture of the Gatika project is designed to support a modular,
scalable, and maintainable Gantt chart application. This chapter provides an
overview of the application’s high-level structure, the interaction between its
components, and the technologies used.

## High-Level Architecture

Gatika follows a client-side, single-page application (SPA) architecture using
SolidJS as the core framework. The architecture uses fully reactive state
management, where changes in the application store automatically update to all
derived variables and the user interface. This approach eliminates manual
synchronization and ensures a seamless, real-time user experience.

The application uses browser-based localStorage for persisting data such as
tasks and projects. A custom wrapper synchronizes the reactive store with
localStorage, enabling the system to maintain its state across browser sessions
while retaining the real-time reactivity of the SolidJS framework.

Testing and automation tools, including Vitest and Playwright, are integrated
into the architecture, ensuring the quality and accessibility of the application
through automated processes.

## Key Modules and Their Roles

The Gatika project is organized into distinct modules, each serving a specific
role in the system. This modular structure simplifies development and ensures
the application remains scalable and maintainable.

### Components

The components directory contains the building blocks of the user interface.
These reusable and modular UI elements provide consistency across the
application while enabling flexibility in design. Key components include:

- Form Elements: Custom input fields, dropdown menus, and buttons used across
  forms.
- Layout Components: Structures like headers, footers, and content sections that
  ensure a unified visual layout.
- Gantt Chart: A specialized component for visualizing tasks and dependencies in
  a timeline format, offering interactivity and scalability. Implemented using
  CSS Grid, with task rows and columns calculated based on task start and end
  dates. Styles for the chart are defined using stylexjs, ensuring zero runtime
  overhead and dynamic updates driven by the state of the store.

By separating interface elements into components, the application maintains a
clear structure, improving the ease of updates and feature extensions.

### Features

The features directory implements the core functionalities of the application.
This includes:

- Task Management: Handles task creation, editing, and deletion, as well as
  managing dependencies and schedules. It integrates with the Gantt chart to
  display tasks visually.
- Project Management: Supports the organization of tasks within projects,
  allowing users to group and track related activities.
- Notifications: Provides real-time feedback to users, such as success messages
  for completed actions or error alerts for invalid operations.

These features are designed to work seamlessly together, with minimal coupling,
allowing for independent updates or enhancements.

### Lib

The lib directory functions as a utility layer, housing shared code and helper
functions used across the project. It ensures that common tasks are handled in a
consistent and reusable manner. Examples include:

- Date Utilities: Functions for formatting dates, calculating durations, and
  determining the start of a week.
- Logger: A development tool for debugging and tracking application events
  during runtime.
- Data Population: Scripts for initializing the application with sample tasks
  and projects, useful for demos and testing.

By consolidating reusable logic, the lib directory promotes clean and
maintainable code.

### Routes

The routes directory defines the navigation structure of the application,
mapping URLs to specific pages or views. Each route corresponds to a distinct
section of the application, such as:

- Dashboard: Displays an overview of recently accessed projects and upcoming
  tasks.
- Gantt Chart View: Provides a detailed timeline visualization of tasks.
- Project and Task Details: Allows users to view, edit, and manage individual
  projects or tasks.

Routes integrate with the components and features to dynamically display content
and respond to user interactions, ensuring a smooth navigation experience.

## State Management

The system’s state management is built on reactive stores, which automatically
update changes to the user interface and other derived data. A custom wrapper
synchronizes these stores with localStorage, providing persistence without
compromising the reactivity of the system. This approach ensures that updates to
the state are reflected consistently across the application.

## Data Flow

Gatika employs a unidirectional data flow to ensure simplicity and reliability.
User interactions, such as creating or editing tasks, modify the reactive store,
which automatically synchronizes with localStorage. These updates trigger
changes across the application, including the user interface, ensuring all
displayed information reflects the latest state in real-time without manual
synchronization.

## Technology Stack

The application leverages modern tools and technologies to ensure high
performance and maintainability. SolidJS provides a reactive framework for
building the user interface. The system uses localStorage for data persistence,
ensuring state retention across sessions. Development is supported by Vite for
fast builds, Vitest for unit testing, and Playwright for end-to-end testing.
Styling is managed with stylexjs, which provides zero-runtime-cost CSS-in-JS
solutions, and GitHub Actions automate testing workflows to maintain code
quality.

## Advantages of the Architecture

The architecture of Gatika achieves a balance of simplicity, scalability, and
responsiveness. The fully reactive state management system ensures that changes
in the application store update automatically to the interface. The modular
structure allows developers to introduce new features without disrupting
existing functionality. Tools like Vite and SolidJS optimize performance, while
stylexjs and CSS Grid ensure efficient and dynamic Gantt chart rendering.
Testing frameworks, including Vitest and Playwright, maintain reliability
throughout development, creating a robust and maintainable system for future
enhancements.

# Key Technologies

The Gatika project is built with modern tools and frameworks chosen to optimize
performance, maintainability, and user experience. Each technology plays a
specific role in achieving these objectives, from reactive state management to
seamless development workflows.

## SolidJS for Reactive Frontend Development

SolidJS forms the foundation of Gatika’s frontend architecture. This reactive
framework enables real-time updates to the user interface by updating changes in
the application state to all derived variables and components. The system’s
fully reactive design eliminates the need for manual synchronization. Changes to
the store trigger automatic updates in the Gantt chart, notifications, and other
UI elements, ensuring a dynamic and responsive experience.

## State Persistence with LocalStorage

The project uses localStorage for data persistence. A custom synchronization
wrapper integrates localStorage with reactive stores, ensuring data retention
across browser sessions while preserving the application’s reactivity. This
approach provides persistent state management without introducing unnecessary
complexity or server dependencies.

## Dynamic Styling with StylexJS

Styling in Gatika is powered by stylexjs, a zero-runtime-cost CSS-in-JS library.
The Gantt chart is implemented using CSS Grid, with rows and columns dynamically
calculated based on task start and end dates. These styles react directly to
changes in the store, creating a dynamic visual representation that updates
seamlessly with user interactions.

## Development Enviroment

The development environment uses Vite for fast and efficient builds,
significantly improving development and deployment workflows. Testing is
supported by Vitest for unit tests and Playwright for end-to-end testing.
Playwright incorporates axe-core for automated accessibility testing, ensuring
compliance with accessibility standards. GitHub Actions automates testing
workflows, running both unit and end-to-end tests on every commit and pull
request. Local git hooks are enforced using lefthook, which executes tests
before any commit or push to maintain code quality.

## Collaboration Workflow

The project adheres to the GitHub Flow branching model, emphasizing short-lived
feature branches and pull requests for structured collaboration. Commit messages
follow the Conventional Commits standard, validated by Commitlint to ensure
consistency and clarity in the commit history.

# Module Interactions and Integration

This chapter focuses on the relationships and interactions between Gatika’s core
modules, showcasing how components, features, utilities, and routes work
together to deliver a seamless user experience.

## Interaction Between Modules

The modular architecture of Gatika ensures that each part of the application
performs a specific role while remaining closely integrated with other modules.
Key examples include:

- Gantt Chart Integration: The Gantt chart component relies on data provided by
  the task and project management features. Task start and end dates are
  processed using the date utilities from the lib module to ensure accurate
  rendering. The chart is implemented using CSS Grid, with task rows and columns
  dynamically calculated based on the start and end dates. Styling is managed
  using stylexjs, enabling fully reactive updates to the chart based on changes
  in the store.
- Dynamic Navigation: Routes such as the dashboard or project details
  dynamically load components based on data retrieved from the features module.
  This ensures that users can seamlessly navigate through the application while
  interacting with real-time data, with changes updating automatically to the
  interface.
- Notifications: The notification system is triggered by user actions across
  multiple features. For instance, creating or editing a task triggers feedback
  messages that inform users of success or errors, ensuring a smooth workflow.

## Examples of Integration

### Task Creation and Visualization

When a user creates a task, the following steps occur:

1. The form component captures input data, such as the task name, dates, and
   dependencies.
2. The task management feature validates the input and updates the application’s
   state using SolidJS signals.
3. The Gantt chart component reflects the new task in real-time, using date
   utilities from the lib module to calculate its placement on the timeline.
   Changes in the store automatically update the chart’s layout and styling
   through stylexjs, ensuring visual consistency.

### Notifications in Action

Notifications are triggered when an action, such as deleting a task, is
performed. The notification system retrieves the status of the operation from
the task management feature and displays appropriate feedback to the user.

## Benefits of Modular Integration

This tightly integrated architecture allows Gatika to function as a cohesive
system. The modular design ensures that individual components and features can
be updated or extended without disrupting the overall application. The use of
stylexjs for dynamic styling and CSS Grid for the Gantt chart enhances the
performance and maintainability of the system. The fully reactive design ensures
efficient collaboration between the user interface, business logic, and data
persistence layers, creating a smooth and reliable user experience.

# Testing

Testing is a critical component of the Gatika project to ensure reliability,
maintainability, and a seamless user experience. This chapter provides an
overview of the testing strategy, tools used, and the implementation of various
test types, including unit tests, end-to-end tests, and continuous integration
workflows.

## Testing Strategy

The Gatika project adopts a layered testing approach that includes unit testing,
end-to-end testing, and continuous integration workflows. Unit tests focus on
verifying individual components and modules in isolation, while end-to-end (E2E)
tests validate the application's behavior from the user's perspective.
Continuous integration (CI) ensures automated execution of these tests during
the development process, maintaining the quality and stability of the codebase.

## Tools Used

The project employs the following tools for testing:

- Vitest: A fast and developer-friendly test runner used for unit and
  integration testing. It integrates seamlessly with Vite and uses the V8 engine
  for coverage analysis
- Playwright: A robust framework for end-to-end testing, supporting
  cross-browser compatibility and advanced debugging tools such as screenshots
  and video recording. Playwright integrates axe-core to automate accessibility
  testing, ensuring compliance with accessibility standards
- GitHub Actions: Automates the testing workflows, running both unit and E2E
  tests for every commit and pull request. This ensures consistent test
  execution and early detection of issues
- Lefthook: Enforces local git hooks, running tests automatically before commits
  and pushes to prevent errors from being introduced into the repository

## Unit Testing

Unit testing focuses on verifying the behavior of individual components, utility
functions, and business logic. Tests ensure that each unit works correctly under
various conditions.

Unit tests are implemented alongside their respective modules. For example:

- Nav.test.tsx tests the navigation component, verifying correct rendering and
  link functionality.
- Task.test.tsx validates task operations, including dependency checks and CRUD
  functionality.

Developers can execute unit tests using the following command:

- To run unit tests: bun test:unit
- To analyze test coverage: bun test:unit:cov

## End-to-End Testing

End-to-end testing simulates user interactions to ensure the application works
as expected. These tests cover workflows such as task creation, linking tasks to
projects, and verifying task display in the Gantt chart.

Playwright is used to implement E2E tests, enabling features such as
cross-browser testing and debugging. Additionally, axe-core is integrated to
perform automated accessibility testing, identifying and addressing
accessibility issues. Key tests include navigation between views (e.g., the
dashboard and Gantt chart) and validating form submissions.

E2E tests can be run using the command: bun test:e2e. Playwright provides
debugging tools like screenshots and step-by-step traces to help diagnose issues
during test failures.

## Continuous Integration

The testing process is automated using GitHub Actions, ensuring that tests are
executed consistently. A dedicated workflow file (test-suite.yml) defines the CI
pipeline. The workflow is triggered on every push and pull request, running both
unit and E2E tests.

The CI workflow performs the following steps:

1. Installs dependencies using Bun.
2. Sets up Playwright dependencies for E2E tests.
3. Executes unit tests with coverage reporting.
4. Runs E2E tests to validate the application workflows.

This automation ensures that potential issues are caught early, maintaining the
stability and reliability of the codebase.

## Advantages of the Testing Approach

The testing approach in Gatika ensures a reliable and maintainable application.
Unit and E2E tests verify the behavior of individual components and the overall
system, while CI workflows streamline the testing process by automating it.
Debugging tools provided by Playwright help diagnose and resolve issues quickly,
enhancing development efficiency. The integration of local git hooks via
Lefthook ensures that all code changes meet testing and quality standards before
entering the repository.

By combining unit testing, end-to-end testing, and CI automation, Gatika
maintains a high standard of quality throughout its development lifecycle.

# Known Issues and Future Improvements

To be written at the end of the course by developers…

# Project Setup (for inexperienced developers)

This chapter outlines the presents steps to set up and run the Gatika project
locally. It includes system requirements, installation instructions, and
information on how to start the development server. This chapter is for
inexperienced developers such as students.

## System Requirements

To set up and run the Gatika project, ensure that the following requirements are
met:

- Node.js (version 16 or newer)
- Bun, a modern JavaScript runtime used for dependency management and running
  the development server
- A modern web browser (e.g., Chrome, Firefox, or Edge)

## Installation Instructions

Follow these steps to clone the repository, install dependencies, and start the
development server:

1. Clone the repository:
   - Open a terminal and navigate to the desired folder
   - Run the command: git clone <repository-url>
   - Navigate to the cloned repository: cd <repository-folder>
2. Install Bun:
   - Run the command: npm install -g bun
3. Install Playwright dependencies:
   - Run the command: bunx playwright install --with-deps
4. Install project dependencies:
   - Run the command: bun install
5. Start the development server:
   - Run the command: bun dev
   - Open your browser and navigate to http://localhost:3000

## Project Commands

The following commands are available for managing the project:

- To start the development server: bun dev
- To build the project for production: bun build
- To preview the production build: bun preview
- To run unit tests: bun test:unit
- To run end-to-end tests: bun test:e2e
- To check code formatting: bun lint
- To apply code formatting fixes: bun format

## Troubleshooting

Below are tips for resolving common setup issues:

- Bun Installation Issues: Ensure that Node.js is installed and up-to-date
  before installing Bun.
- Playwright Dependencies: If Playwright dependencies are missing, run the
  command: bunx playwright install --with-deps.
- Browser Compatibility: If the application does not render correctly, ensure
  you are using a supported browser and that JavaScript is enabled.
