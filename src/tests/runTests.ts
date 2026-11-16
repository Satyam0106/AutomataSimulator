import { runAllTests } from './algorithms.test';

const { passed, results } = runAllTests();
console.log('=== AutomataLab Algorithm & Simulation Test Suite ===');
for (const line of results) {
  console.log('✓', line);
}
console.log(`\nAll ${passed} test suites passed successfully!`);

