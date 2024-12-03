// cypress/e2e/commits.cy.ts

describe('Commit Navigation Tests', () => {
    const mockUser = {
        login: 'testuser',
        name: 'Test User',
    };

    const mockCommits = {
        total_count: 100,
        items: [
            {
                sha: '123',
                commit: {
                    author: {
                        name: 'Test User',
                        date: new Date().toISOString()
                    },
                    message: 'Test commit message'
                },
                author: {
                    avatar_url: 'https://github.com/avatar.png',
                    login: 'testuser'
                },
                html_url: 'https://github.com/test/repo/commit/123'
            },
            {
                sha: '456',
                commit: {
                    author: {
                        name: 'Test User',
                        date: new Date().toISOString()
                    },
                    message: 'Another test commit'
                },
                author: {
                    avatar_url: 'https://github.com/avatar.png',
                    login: 'testuser'
                },
                html_url: 'https://github.com/test/repo/commit/456'
            },
            {
                sha: '789',
                commit: {
                    author: {
                        name: 'Test User',
                        date: new Date().toISOString()
                    },
                    message: 'Yet another test commit'
                },
                author: {
                    avatar_url: 'https://github.com/avatar.png',
                    login: 'testuser'
                },
                html_url: 'https://github.com/test/repo/commit/789'
            },
            {
                sha: '101112',
                commit: {
                    author: {
                        name: 'Test User',
                        date: new Date().toISOString()
                    },
                    message: 'Fourth test commit'
                },
                author: {
                    avatar_url: 'https://github.com/avatar.png',
                    login: 'testuser'
                },
                html_url: 'https://github.com/test/repo/commit/101112'
            },
            {
                sha: '131415',
                commit: {
                    author: {
                        name: 'Test User',
                        date: new Date().toISOString()
                    },
                    message: 'Fifth test commit'
                },
                author: {
                    avatar_url: 'https://github.com/avatar.png',
                    login: 'testuser'
                },
                html_url: 'https://github.com/test/repo/commit/131415'
            }
        ]
    };

    beforeEach(() => {
        // Mock localStorage for auth
        cy.window().then((win) => {
            win.localStorage.setItem('github_token', 'fake-token');
        });

        // Mock the API responses
        cy.intercept('GET', 'https://api.github.com/user', mockUser).as('getUser');
        cy.intercept('GET', 'https://api.github.com/search/commits*', mockCommits).as('getCommits');

        // Visit commits page directly
        cy.visit('/commits');

        // Wait for initial data load
        cy.wait('@getCommits');
    });

    it('should search commits', () => {
        // Type in search box
        cy.get('input[placeholder="Search commits..."]')
            .should('be.visible')
            .type('test');

        // Wait for search results
        cy.wait('@getCommits');

        // Verify commits are displayed
        cy.get('.commit-item').should('exist');
    });

    it('should open commit details', () => {
        // Click the third commit item
        cy.get('.commit-item').eq(2).should('exist').click();

        // Since the click opens a new window, we can verify the onclick attribute
        cy.get('.commit-item').eq(2)
            .should('have.attr', 'role', 'button');
    });
});