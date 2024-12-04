# GitHub Insights Dashboard

The GitHub Insights Dashboard is a web application that provides users with insights and analytics about their GitHub activity. It allows users to log in using their GitHub access token and view various statistics and visualizations related to their commits, repositories, and programming languages.

[Video Screen1733278440309.webm](https://github.com/user-attachments/assets/eb2f1004-0a41-4e6e-9a20-e7b6ea584645)



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

The project includes end-to-end tests to ensure key features work as expected:

1. Authentication Flow: Verifies users can log in with a valid GitHub token and see their GitHub data on the dashboard.

2. Commit History Filtering: Ensures users can search commits and filter by date range and navigate to real commit page on Github

3. Dashboard Components Test: Verifies the presence and functionality of all dashboard components.

## Technologies Used

- React: JavaScript library for building user interfaces
- TypeScript: Typed superset of JavaScript for enhanced development experience
- React Router: Library for handling client-side routing in React applications
- Vite: Fast build tool and development server
- Tegel Design System: Scania's design system for consistent and accessible UI components
- Chart.js: JavaScript charting library for creating interactive charts
- GitHub API: REST API for accessing GitHub data

## Caching for performance and to provide a better user experience with smooth navigation.:
### Implemented caching for the GitHub dashboard data using localStorage and add a timestamp to control cache validity.

- Cache duration set to 15 minutes
- Stores data in localStorage
- Includes timestamp for cache validation

Cache management:
- Automatic cache invalidation after 15 minutes
- Error handling for corrupted cache
- Cache clearing on errors

Optimized data fetching:
- Checks cache before making API calls
- Forces fetch on manual refresh
- Forces fetch on interval refresh

## Design Patterns Used:
- Singleton Pattern: Single instance of GitHubService
- Repository Pattern: Centralized data access layer
- Service Layer Pattern: Abstraction for API operations
- Factory Pattern (in a way): Centralized object creation


