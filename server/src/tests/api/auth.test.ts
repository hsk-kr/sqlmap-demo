import supertest from 'supertest';
import { TEST_URL } from '../../app';

const TEST_NO_CREATE_TEST_USERS =
  (process.env.TEST_NO_CREATE_TEST_USERS ?? '').toLowerCase() === 'true';
const request = supertest(TEST_URL);

describe('Sign Up', () => {
  test('should return BadRequest', (done) => {
    request.post('/auth/sign-up').expect(400, done);
  });

  if (!TEST_NO_CREATE_TEST_USERS) {
    test('should create a user', (done) => {
      request
        .post('/auth/sign-up')
        .send({
          username: 'test',
          password: 'test',
        })
        .expect(201, done);
    });
  }

  test('should have an existing username', async () => {
    const res = await request
      .post('/auth/sign-up')
      .send({
        username: 'test',
        password: 'test',
      })
      .expect(400);

    expect(res.body.message).toBe('username exists');
  });
});

describe('Sign In', () => {
  beforeAll((done) => {
    if (!TEST_NO_CREATE_TEST_USERS) {
      request
        .post('/auth/sign-up')
        .send({
          username: 'signin',
          password: 'signin',
        })
        .expect(201, done);
    } else {
      done();
    }
  });

  test('should be sucessfully signed in', (done) => {
    request
      .post('/auth/sign-in')
      .send({
        username: 'signin',
        password: 'signin',
      })
      .expect(200, done);
  });

  test('should fail to sign in with wrong username', async () => {
    const res = await request
      .post('/auth/sign-in')
      .send({
        username: 'signin1',
        password: 'signin',
      })
      .expect(400);

    expect(res.body.message).toBe('user does not exist');
  });

  test('should fail to sign in with wrong passwprd', async () => {
    const res = await request
      .post('/auth/sign-in')
      .send({
        username: 'signin',
        password: 'signin1',
      })
      .expect(400);

    expect(res.body.message).toBe('incorrect password');
  });
});
