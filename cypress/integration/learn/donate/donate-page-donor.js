describe('Donate page', () => {
  beforeEach(() => {
    cy.exec('npm run seed -- --donor');
    cy.login();
  });

  it('Donor alert should be visible for donor', () => {
    cy.visit('/donate');

    cy.get('[data-cy="donate-alert"]').should('be.visible');

    cy.get('[data-cy="donate.thank-you"]').should(
      'have.text',
      'Thank you for being a supporter of freeCodeCamp. You currently have a recurring donation.'
    );
    cy.get('[data-cy="donate.bigger-donation"]').should(
      'have.text',
      "Want to make a bigger one-time donation, mail us a check, or give in other ways? Here are many other ways you can support our non-profit's mission."
    );
    cy.get('[data-cy="donate-link"]').should(
      'contain.attr',
      'href',
      'https://www.freecodecamp.org/news/how-to-donate-to-free-code-camp'
    );
  });
});
