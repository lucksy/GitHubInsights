import './commands';

beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
});

Cypress.on('uncaught:exception', (err) => {
    // returning false here prevents Cypress from failing the test
    if (err.message.includes('ResizeObserver')) {
        return false;
    }
    return true;
});