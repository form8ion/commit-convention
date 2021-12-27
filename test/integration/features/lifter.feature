Feature: Lift

  Scenario: legacy semantic-release in a GitHub workflow
    Given semantic-release is configured
    And legacy releases are configured in a GitHub workflow
    When the project is lifted
