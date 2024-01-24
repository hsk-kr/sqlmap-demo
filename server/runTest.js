const { spawn } = require('child_process');

const isTestResult = (text) => {
  /**
   * Test Text Example:
   * Test Suites: 2 passed, 2 total
   * Tests:       14 passed, 14 total
   * Snapshots:   0 total
   * Time:        5.126 s
   * Ran all test suites.
   */
  const trimText = text.trim();

  return (
    trimText.startsWith('Test Suites:') &&
    trimText.endsWith('Ran all test suites.')
  );
};

const isTestPass = (text) => {
  /**
   * Test Text Example:
   * Test Suites: 2 passed, 2 total
   * Tests:       14 passed, 14 total
   * Snapshots:   0 total
   * Time:        5.126 s
   * Ran all test suites.
   */

  let testText = text.split('Tests:');
  testText = testText[1].split('Snapshots:');
  testText = testText[0].split(',');

  const result = { failed: 0, passed: 0, total: 0 };

  for (const str of testText) {
    const [count, label] = str.trim().split(' ');

    result[label] = Number(count);
  }

  return result.total === result.passed;
};

const runTestScriptIfServerIsReady = (url) => {
  const tm = setInterval(async () => {
    try {
      await fetch(url);

      clearInterval(tm);

      const test = spawn('npm', ['run', 'test']);
      let error = false;

      const printAndCheckAllTestPass = (data) => {
        console.log(data);

        if (isTestResult(data)) {
          error = !isTestPass(data);
        }
      };

      test.stdout.setEncoding('utf8');
      test.stdout.on('data', printAndCheckAllTestPass);

      test.stderr.setEncoding('utf8');
      test.stderr.on('data', printAndCheckAllTestPass);

      test.on('close', () => {
        if (error) {
          process.exit(1);
        }
      });
    } catch {}
  }, 1000);
};

runTestScriptIfServerIsReady(process.env.TEST_URL);
