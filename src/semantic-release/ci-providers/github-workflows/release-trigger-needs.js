export default function (jobs) {
  const jobNames = Object.keys(jobs);

  return [
    ...jobNames.includes('verify') ? ['verify'] : [],
    ...jobNames.includes('verify-matrix') ? ['verify-matrix'] : []
  ];
}
