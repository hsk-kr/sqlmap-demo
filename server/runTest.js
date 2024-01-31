const { spawn } = require('child_process');

const runTestScriptIfServerIsReady = (url) => {
  const tm = setInterval(async () => {
    try {
      await fetch(url);
      clearInterval(tm);

      const test = spawn('npm', ['run', 'test']);

      const printAndCheckAllTestPass = (data) => console.log(data);

      test.stdout.setEncoding('utf8');
      test.stdout.on('data', printAndCheckAllTestPass);

      test.stderr.setEncoding('utf8');
      test.stderr.on('data', printAndCheckAllTestPass);

      test.on('exit', (code) => process.exit(code));
    } catch {}
  }, 1000);
};

runTestScriptIfServerIsReady(process.env.TEST_URL);
