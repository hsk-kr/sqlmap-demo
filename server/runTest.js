const { spawn } = require('child_process');

const INTERVAL = 1000;

const runTestScriptIfServerIsReady = async () => {
  try {
    await fetch(process.env.TEST_URL);

    const test = spawn('npm', ['run', 'test']);

    const printAndCheckAllTestPass = (data) => console.log(data);

    test.stdout.setEncoding('utf8');
    test.stdout.on('data', printAndCheckAllTestPass);

    test.stderr.setEncoding('utf8');
    test.stderr.on('data', printAndCheckAllTestPass);

    test.on('exit', (code) => process.exit(code));
  } catch {
    setTimeout(runTestScriptIfServerIsReady, INTERVAL);
  }
};

setTimeout(runTestScriptIfServerIsReady, INTERVAL);
