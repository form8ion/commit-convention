Feature: Scaffolder

  Scenario: configure the convention
    When the project is scaffolded
    Then commitlint will be configured

  Scenario: project not on github actions
    When the project is scaffolded

  Scenario: project on github actions that is not semantically released
    When the project is scaffolded

  Scenario: semantically-released package on github actions
    When the project is scaffolded
