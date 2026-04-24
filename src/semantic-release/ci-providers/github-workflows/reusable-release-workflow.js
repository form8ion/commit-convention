export function determineAppropriateWorkflow(nodeVersion) {
  if (18 > nodeVersion) return 'form8ion/.github/.github/workflows/release-package-semantic-release-19.yml@master';
  if (20 > nodeVersion) return 'form8ion/.github/.github/workflows/release-package-semantic-release-22.yml@master';

  return 'form8ion/semantic-release-workflow/.github/workflows/release.yml@v2.0.0';
}
