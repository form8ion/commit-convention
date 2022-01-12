Feature: Lift

  Scenario: legacy semantic-release in a GitHub workflow
    Given semantic-release is configured
    And legacy releases are configured in a GitHub workflow
    When the project is lifted
    Then the release workflow is defined
    And the verification workflow triggers the release workflow

  Scenario: modern semantic-release in GitHub workflows
    Given semantic-release is configured
    And modern releases are configured in a GitHub workflow
    When the project is lifted
    Then the release workflow is defined

  Scenario: no existing release
    Given semantic-release is configured
    And no release is configured in a GitHub workflow
    When the project is lifted
    Then the release workflow is defined
    And the verification workflow triggers the release workflow

  Scenario: no release needed
    Given semantic-release is not configured
    And no release is configured in a GitHub workflow
    When the project is lifted
    Then the release workflow is not defined
    And the verification workflow does not trigger the release workflow

  Scenario: no GitHub workflows
    Given semantic-release is configured
    But no GitHub workflows exist
    When the project is lifted
    Then the release workflow is not defined
