Feature: Experimental Release

  Scenario: Experimental Release exists, but with legacy workflow name
    Given semantic-release is configured
    And the release workflow is called from the ci workflow
    And a legacy release workflow is defined
    When the project is lifted
    Then the experimental release workflow calls the reusable workflow for alpha branches
    And the legacy experimental release workflow has been renamed

  Scenario: legacy release trigger
    Given semantic-release is configured
    And a local release workflow is defined
    And the release workflow is triggered from the ci workflow
    When the project is lifted
    Then the experimental release workflow calls the reusable workflow for alpha branches
    And the legacy experimental release workflow has been renamed
    And the verification workflow calls the reusable release workflow
