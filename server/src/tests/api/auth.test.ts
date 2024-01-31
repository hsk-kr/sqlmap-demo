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
