Feature: older node version

  Scenario: project configured to use older node
    Given the project uses node 16
    And semantic-release is configured
    And no release is configured in a GitHub workflow
    When the project is lifted
    Then the release workflow calls the reusable workflow for semantic-release v19 for alpha branches
    And the verification workflow calls the reusable release workflow for semantic-release v19
