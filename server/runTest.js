const { spawn } = require('child_process');

const runTestScriptIfServerIsReady = (url) => {
  const tm = setInterval(async () => {
    try {
      await fetch(url);

      clearInterval(tm);

      const test = spawn('npm', ['run', 'test']);

      test.stdout.setEncoding('utf8');
      test.stdout.on('data', (data) => {
        console.log(data);
      });

      test.stderr.setEncoding('utf8');
      test.stderr.on('data', (data) => {
        console.error(data);
        process.exit(1);
      });
    } catch {}
  }, 1000);
};

const url = process.env.TEST_URL ?? 'http://localhost:3000/';

runTestScriptIfServerIsReady(url);
