Feature: older node version

  @wip
  Scenario: project configured to use older node
    Given the project uses node 16
    When the project is lifted
