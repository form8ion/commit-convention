Feature: Lift Commitlint

  @wip
  Scenario: js config exists
    Given commitlint is configured with a "js" extension
    When the project is lifted
    Then commitlint will be configured
    But other commitlint config formats do not exist

  @wip
  Scenario: cjs config exists
    Given commitlint is configured with a "cjs" extension
    When the project is lifted
    Then commitlint will be configured
    But other commitlint config formats do not exist
