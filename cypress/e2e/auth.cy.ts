describe('Authentication Tests', () => {
    const GITHUB_TOKEN = Cypress.env('GITHUB_TOKEN');

    beforeEach(() => {
        cy.visit('/login');
    });

    it('should show error for invalid token', () => {
        cy.get('input[placeholder*="GitHub token"]').type('bad_token');
        cy.get('button').contains('Log in').click();
        cy.get('[variant="error"]').should('be.visible');
    });

    it('should login successfully with valid token', () => {
        cy.get('input[placeholder*="GitHub token"]').type(GITHUB_TOKEN);
        cy.get('button').contains('Log in').click();
        cy.url().should('include', '/dashboard');
    });

    it('should logout successfully', () => {
        // Login first
        cy.get('input[placeholder*="GitHub token"]').type(GITHUB_TOKEN);
        cy.get('button').contains('Log in').click();

        // Wait for dashboard to load
        cy.url().should('include', '/dashboard');

        // Click the user menu
        cy.get('tds-header-dropdown').click();

        // Click logout button
        cy.contains('button', 'Logout').click();

        // Verify redirect to login
        cy.url().should('include', '/login');
    });
});