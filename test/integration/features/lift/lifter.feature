Feature: Lift

  Scenario: legacy semantic-release in a GitHub workflow
    Given semantic-release is configured
    And legacy releases are configured in a GitHub workflow
    When the project is lifted
    Then the experimental release workflow calls the reusable workflow for alpha branches
    And the verification workflow calls the reusable release workflow

  Scenario: cycjimmy action in a GitHub workflow
    Given semantic-release is configured
    And the cycjimmy action is configured in a GitHub workflow
    When the project is lifted
    Then the experimental release workflow calls the reusable workflow for alpha branches
    And the verification workflow calls the reusable release workflow
    And the cycjimmy action was removed

  Scenario: modern semantic-release in GitHub workflows
    Given semantic-release is configured
    And the release workflow is called from the ci workflow
    And an experimental release workflow is defined
    When the project is lifted
    Then the experimental release workflow calls the reusable workflow for alpha branches

  Scenario: modern semantic-release in GitHub workflows, but trigger does not wait for verification
    Given semantic-release is configured
    And the release workflow is called from the ci workflow
    And an experimental release workflow is defined
    When the project is lifted
    Then the experimental release workflow calls the reusable workflow for alpha branches
    And the release is not called until verification completes

  Scenario: modern semantic-release in GitHub workflows verifying multiple node versions, but trigger does not wait for verification
    Given semantic-release is configured
    And the release workflow is called from the ci workflow
    And an experimental release workflow is defined
    And multiple node versions are verified
    When the project is lifted
    Then the experimental release workflow calls the reusable workflow for alpha branches
    And the release is not called until verification completes

  Scenario: no existing release
    Given semantic-release is configured
    And no release is configured in a GitHub workflow
    When the project is lifted
    Then the experimental release workflow calls the reusable workflow for alpha branches
    And the verification workflow calls the reusable release workflow

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

  Scenario: release trigger
    Given semantic-release is configured
    And a local release workflow is defined
    And the release workflow is triggered from the ci workflow
    When the project is lifted
    Then the experimental release workflow calls the reusable workflow for alpha branches
    And the verification workflow calls the reusable release workflow
