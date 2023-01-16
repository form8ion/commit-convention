export function determineAppropriateWorkflow(nodeVersion) {
  if (18 > nodeVersion) return 'form8ion/.github/.github/workflows/release-package-semantic-release-19.yml@master';

  return 'form8ion/.github/.github/workflows/release-package.yml@master';
}
