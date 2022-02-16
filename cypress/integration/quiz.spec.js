describe('quiz app', () => {
  beforeEach(() => {
    cy.visit('localhost:3000/')
  })
  it('사용자는 퀴즈 풀기 버튼을 클릭하여 퀴즈 풀기를 시작할 수 있다.', () => {
    cy.get('[data-cy=start-quiz-btn]').should('have.text', '퀴즈 풀기')
    cy.get('[data-cy=start-quiz-btn]').click()
    cy.get('[data-cy=quiz-card]').should('exist', 4)
  })
  it('사용자는 문항에 대한 답안을 4개 보기 중에 선택할 수 있다.', () => {
    cy.get('[data-cy=start-quiz-btn]').click()
    cy.get('[data-cy=quiz-choice]').should('have.length', 4)
  })
})