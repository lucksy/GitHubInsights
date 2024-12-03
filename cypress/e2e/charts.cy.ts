describe('Chart Tests', () => {
    const mockUser = {
        login: 'testuser',
        name: 'Test User',
        public_repos: 25,
        followers: 100,
        following: 50,
        avatar_url: 'https://avatars.githubusercontent.com/u/test',
        company: 'Test Company'
    };

    const mockRepos = [
        { name: 'repo1', language: 'JavaScript' },
        { name: 'repo2', language: 'TypeScript' },
        { name: 'repo3', language: 'Python' }
    ];

    // const mockCommitStats = {
    //     totalCommits: 1250,
    //     monthlyCommits: {
    //         Jan: 100,
    //         Feb: 120,
    //         Mar: 150,
    //         Apr: 200,
    //         May: 300,
    //         Jun: 380
    //     }
    // };

    beforeEach(() => {
        // Mock localStorage for auth
        cy.window().then((win) => {
            win.localStorage.setItem('github_token', 'fake-token');
        });

        // Setup API mocks
        cy.intercept('GET', 'https://api.github.com/user', mockUser).as('getUser');
        cy.intercept('GET', 'https://api.github.com/users/*/repos*', mockRepos).as('getRepos');
        cy.intercept('GET', 'https://api.github.com/repos/*/commits*', {
            statusCode: 200,
            body: Array(30).fill({
                commit: {
                    author: {
                        date: new Date().toISOString()
                    }
                }
            })
        }).as('getCommits');

        // Visit dashboard
        cy.visit('/dashboard');

        // Wait for initial data load
        cy.wait('@getUser');
        cy.wait('@getRepos');
    });

    it('should display dashboard cards', () => {
        // Wait for dashboard to load
        cy.get('[data-testid="dashboard-container"]').should('be.visible');

        // Check all four cards using data-testid
        cy.get('[data-testid="projects-card"]').should('be.visible');
        cy.get('[data-testid="commits-card"]').should('be.visible');
        cy.get('[data-testid="followers-card"]').should('be.visible');
        cy.get('[data-testid="following-card"]').should('be.visible');

        // Verify values
        cy.get('[data-testid="projects-card"]')
            .find('.tds-headline-01')
            .contains(mockUser.public_repos.toString());
    });

    it('should display charts', () => {
        cy.get('[data-testid="commits-chart-title"]').should('be.visible');
        cy.get('[data-testid="languages-chart-title"]').should('be.visible');

        cy.get('[data-testid="bar-chart-container"]')
            .should('be.visible')
            .find('canvas')
            .should('exist');

        cy.get('[data-testid="doughnut-chart-container"]')
            .should('be.visible')
            .find('canvas')
            .should('exist');
    });

    it('should display correct data in charts', () => {
        cy.get('[data-testid="projects-card"]')
            .contains('25')
            .should('be.visible');

        cy.get('[data-testid="followers-card"]')
            .contains('100')
            .should('be.visible');

        cy.get('[data-testid="following-card"]')
            .contains('50')
            .should('be.visible');
    });
});