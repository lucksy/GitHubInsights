# GitHub Insights Dashboard

The GitHub Insights Dashboard is a web application that provides users with insights and analytics about their GitHub activity. It allows users to log in using their GitHub access token and view various statistics and visualizations related to their commits, repositories, and programming languages.

## You can check the demo from here: https://git-hub-insights-woad.vercel.app/


## Setup the project in your local

To set up the project locally, follow these steps:

1. Make sure you have Node.js - version 14 or higher

2. Clone the project repository:

```bash
git clone git@github.com:lucksy/GitHubInsights.git
```
3. Navigate to the project directory:

```bash
cd GitHubInsights
```

4. Install the project dependencies:

```bash
npm install
```

5. Start the development server:

```bash
npm run dev
```

6. For cypress E2E test, you have to add GitHub access tokens to cypress.env.json.

```
      "GITHUB_TOKEN": "ghp_00000000000000000"
```

7. Open your browser and visit `http://localhost:5173` to see the application running.

# Please note that I only added support for classic GitHub access tokens (not for Fine-grained personal access tokens)

## Features

- User authentication using GitHub access tokens
- Overview of user's GitHub summary, including total commits, repositories, followers, and following
- Commit history visualization with a heatmap showing commit counts by month
- Programming language composition chart displaying the percentage of each language used
- Detailed commit history page with search and date range filtering
- Responsive design for optimal viewing on different devices

## E2E Tests

The project includes the following end-to-end tests to ensure the critical functionality is working as expected:

1. Authentication Flow Test:
   - Description: This test verifies the authentication flow of the application, ensuring that users can log in with a valid GitHub access token and are redirected to the dashboard with their GitHub information displayed.

2. Commit History Filtering Test:
   - Description: This test verifies the functionality of the commit history filtering feature, ensuring that users can search for specific commits and set a date range to filter the commit history results.

3. Programming Language Chart Test:
   - Description: This test verifies the display and interactivity of the programming language composition chart on the dashboard, ensuring that the chart accurately reflects the user's repository languages and provides tooltips on hover.

## Technologies Used

- React: JavaScript library for building user interfaces
- TypeScript: Typed superset of JavaScript for enhanced development experience
- React Router: Library for handling client-side routing in React applications
- Vite: Fast build tool and development server
- Tegel Design System: Scania's design system for consistent and accessible UI components
- Chart.js: JavaScript charting library for creating interactive charts
- GitHub API: REST API for accessing GitHub data

## Design Patterns Used:
- Singleton Pattern: Single instance of GitHubService
- Repository Pattern: Centralized data access layer
- Service Layer Pattern: Abstraction for API operations
- Factory Pattern (in a way): Centralized object creation

## Design Patterns Used:
- Singleton Pattern: Single instance of GitHubService
- Repository Pattern: Centralized data access layer
- Service Layer Pattern: Abstraction for API operations
- Factory Pattern (in a way): Centralized object creation

