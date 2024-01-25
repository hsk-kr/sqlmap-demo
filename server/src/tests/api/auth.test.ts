import supertest from 'supertest';

const TEST_NO_CREATE_TEST_USERS =
  (process.env.TEST_NO_CREATE_TEST_USERS ?? '').toLowerCase() === 'true';
const request = supertest(process.env.TEST_URL ?? '');

describe('Sign Up', () => {
  const user = {
    username: 'test',
    password: 'test',
  };

  test('should return BadRequest', (done) => {
    request.post('/auth/sign-up').expect(400, done);
  });

  if (!TEST_NO_CREATE_TEST_USERS) {
    test('should create a user', (done) => {
      request.post('/auth/sign-up').send(user).expect(201, done);
    });
  }

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
    if (!TEST_NO_CREATE_TEST_USERS) {
      request.post('/auth/sign-up').send(user).expect(201, done);
    } else {
      done();
    }
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
