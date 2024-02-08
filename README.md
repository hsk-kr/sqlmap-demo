# Restful API Testing (my way) with Express, Maria DB, Docker Compose and Github Action

A few weeks ago, I took a short cyber security course on Udemy. SQL injection was a section of the course. I knew about the concept though, I hadn't tried it. I was planning to make a Restful API server and tried SQL injection using a tool [`sqlmap`](https://sqlmap.org/), which was introduced in the course. While I could have used existing server code, I decided to build one from scratch. It's been a while since I worked on a Restful API server, and I wanted to refresh my knowledge for learning purposes.

I developed a basic Restful API server, and to ensure its APIs would function correctly, I wrote test code using `supertest`. While I tested the server, I encountered two challenges. First, I needed to run a database before testing. Second, I had to manage the data generated during testing. To address these issues, I considered two options: mocking the database and creating a database for testing. I opted for the second option. I believed it would provide more accurate results, and I implemented it using Docker.

What I did may be not the best approach. This is why there is `my way` in the title. As I have mainly been working on React projects, I don't have much practical experience with it. I faced several problems. Do you remember when you first started to code? you just made it work what you wanted to do, even though it was not a good way. I approached it this way. My goal was dockerizing the testing process and integrating it into Github Actions. My hope is that this article will be helpful to others.

**Table of contents:**

- [Server Code](#server-code)
- [Test Code](#test-code)
- [Docker](#docker)
- [Github Action](#github-action)
- [Conclusion](#conclusion)

Since the implementation of the server is not the point of this article, I won't show the all codes. You can check the code [the respotiory](https://github.com/hsk-kr/sqlmap-demo/tree/devto-api-testing).

This picture may be helpful to understand the process better.

![Test Process](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/knqeppsidxfpl0pmctw9.png)

---

# Server Code

[app.ts]

```typescript
import express from 'express';
import { loadEnv } from './configs/env';
import { initDatabase } from './configs/db';
import routes from './routes';

loadEnv();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
for (const [key, value] of Object.entries(routes)) {
  app.use(key, value);
}

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
```

It imports routes and runs the server. Keep it mind that the server starts after database initialization.

[db.ts]

```typescript
import mariadb, { Pool, PoolConnection } from 'mariadb';
import { loadEnv } from './env';
import { createUserTable } from '../models/user.model';
import { createTodoTable } from '../models/todo.model';

loadEnv();

let pool: Pool;

const initPool = async () => {
  try {
    const dbConnectionData = {
      host: process.env.MARIADB_HOST,
      user: process.env.MARIADB_USER,
      password: process.env.MARIADB_PASSWORD,
      connectionLimit: Number(process.env.MARIADB_CONNECTION_LIMIT) ?? 0,
      connectTimeout: Number(process.env.MARIADB_INIT_TIMEOUT) ?? 0,
    };

    const dbConn = await mariadb.createConnection(dbConnectionData);

    const createSqlmapDemoDatabase = async () => {
      await dbConn.execute(
        `CREATE DATABASE IF NOT EXISTS ${process.env.MARIADB_DATABASE} CHARACTER SET utf8`
      );
      await dbConn.end();
    };

    await createSqlmapDemoDatabase();

    pool = await mariadb.createPool({
      ...dbConnectionData,
      database: process.env.MARIADB_DATABASE,
    });
  } catch {
    await initPool();
  }
};

export const getConnection = async <RT>(
  cb: (conn: PoolConnection) => Promise<RT> | RT
): Promise<RT> => {
  let conn;
  let res;

  try {
    conn = await pool.getConnection();
    res = await cb(conn);
  } catch (err) {
    throw err;
  } finally {
    conn?.end();
  }
  return res;
};

export const initDatabase = async () => {
  await initPool();
  createUserTable();
  createTodoTable();
};
```

The `initDatabase` function calls the `initPool` function and creates tables in the database.

The `initPool` function creates a database if it doesn't exist. In the `catch` block, it calls itself to retry to connect the database. In the `docker-compose.yml`, which will be introduced in a later section, a web server container is connected with a database container with `depends_on` option, but since it doesn't mean the database is ready, reconnection logic was needed to ensure the web server is executed with connection the database. In a real project, it would be better to specify the error when a connection is failed.

---

# Test Code

```typescript
import supertest from 'supertest';

const request = supertest(process.env.TEST_URL ?? '');

describe('Sign Up', () => {
  const user = {
    username: 'test',
    password: 'test',
  };

  test('should return BadRequest', (done) => {
    request.post('/auth/sign-up').expect(400, done);
  });

  test('should create a user', (done) => {
    request.post('/auth/sign-up').send(user).expect(201, done);
  });

  test('should have an existing username', async () => {
    const res = await request.post('/auth/sign-up').send(user).expect(400);

    expect(res.body.message).toBe('username exists');
  });
});

describe('Sign In', () => {
  const user = {
    username: 'signin',
    password: 'signin',
  };

  beforeAll((done) => {
    request.post('/auth/sign-up').send(user).expect(201, done);
  });

  test('should be sucessfully signed in', (done) => {
    request.post('/auth/sign-in').send(user).expect(200, done);
  });

  test('should fail to sign in with wrong username', async () => {
    const res = await request
      .post('/auth/sign-in')
      .send({
        ...user,
        username: 'wrongusername',
      })
      .expect(400);

    expect(res.body.message).toBe('user does not exist');
  });

  test('should fail to sign in with wrong password', async () => {
    const res = await request
      .post('/auth/sign-in')
      .send({
        ...user,
        password: 'wrongpassword',
      })
      .expect(400);

    expect(res.body.message).toBe('incorrect password');
  });
});
```

There are two APIs `auth` and `todo`. Test code retrieves the environment `TEST_URL` and requests to the URL.

---

# Docker

## Dockerfile

In the root directory of the server, I created a `Dockerfile` file.

```docker
FROM node:18-alpine3.18

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "run", "dev:once"]
```

The `dev:once` command is written in `package.json` like this

```json
...
"dev:once": "ts-node src/app.ts",
...
```

It executes the `app.ts` file using `ts-code`, and I used `CMD` to make it replaceable instead of `ENTRYPOINT`. It will also be used to execute another script.

## docker-compose

```yml
version: '3.8'

services:
  mariadb:
    image: mariadb:11.2
    environment:
      - MARIADB_ROOT_PASSWORD=admin
  backend:
    build: ../..
    env_file: ../../.env.test
    depends_on:
      - mariadb
  test:
    build: ../..
    env_file: ../../.env.test
    depends_on:
      - backend
    command: ['node', 'runTest.js']
```

There are three services.

- mariadb: It needs the admin password, I wanted to use the database password written in `.env` file because `.env` file contains the database password required for the connection. I didn't solve the problem, but now I think it could've been resolved by writing a script.

- backend: It uses the `Dockerfile` located in the root path of the server. It depends on the `maria-db` service as a database is needed to run the server.

- test: It needs the API server to test, it depends on the `backend` service. As I already mentioned, it doesn't mean that it waits until the web server is ready. So, I wrote a script to execute the test code when the server is available.

The services interact with each other using their names. For instance, the `backend` container accesses the database via `db:3306`.

> [By default, any service can reach any other service at that service's name.](https://docs.docker.com/compose/networking/#link-containers)

## runTest.js

```javascript
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
```

The logic checking if the server is ready is kind of straightforward. It figures the server is ready if the request, which fetches the test URL has no error.

It executes `npm run test`, then prints all output to the console and returns the exit code of the command. Therefore, we can see all the output on Github and if there is an error, the workflow will throw an error.

---

# Github Action

```yml
name: Test

on:
  push:
    branches: ['main']

permissions:
  contents: read

jobs:
  webserver-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Run test files
        uses: isbang/compose-action@v1.5.1
        with:
          compose-file: './server/docker/test/docker-compose.yml'
          up-flags: '--build --abort-on-container-exit'
```

I selected [`isbang/compose-action`](https://github.com/isbang/compose-action) after some research to run Docker Compose. I give the action the path of docker-compose and we need to give a close look at the [`--abort-on-container-exit`](https://docs.docker.com/engine/reference/commandline/compose_up/#options) flag. It stops all containers if any container was stopped.

With the flag, all the containers will be stopped when the test is done.

---

![Github Action](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/00xvmhi3st94d1qxt1rd.png)

![Run Test task](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kbienyfmqc94b1uvuwvn.png)

---

# Conclusion

It wasn't the purpose of the project though, it was a fun experience, Implementing what I wanted.

Things I struggled the most with are the following:

- Using environment docker-compose.yml: I haven't resolved this issue yet. Initially, I believed the `env_file` could also be utilized within the docker-compose file itself. However, I later realized that environment variables can only be used within a container.
- Delay executing a command until a specific container is ready: Since there are lots of frameworks and libraries out there, at some point, I started to google to find third parties that work perfectly for my cases and not even give it a try by myself, like a person who is finding a piece to my puzzle. But I realized that being aware of that we can make it work ourselves, of course, we can replace it with a better way later.

Thanks for reading this article. I hope you found it helpful!

You can check the full code [here - Github](https://github.com/hsk-kr/sqlmap-demo/tree/devto-api-testing).

Happy Coding!
