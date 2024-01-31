import supertest from 'supertest';

const request = supertest(process.env.TEST_URL ?? '');
let commonHeader = {};

describe('Todo', () => {
  beforeAll(async () => {
    const username = 'todo';
    const password = 'todo';

    await request
      .post('/auth/sign-up')
      .send({
        username,
        password,
      })
      .expect(201);

    const res = await request
      .post('/auth/sign-in')
      .send({
        username,
        password,
      })
      .expect(200);

    commonHeader = {
      Authorization: `Bearer ${res.body.accessToken}`,
    };
  });

  test('should create todo', async () => {
    const createTodoRes = await request
      .post('/todos')
      .set(commonHeader)
      .send({
        content: 'content',
      })
      .expect(201);

    const {
      data: { id },
    } = createTodoRes.body;

    const todoRes = await request
      .get(`/todos/${id}`)
      .set(commonHeader)
      .expect(200);

    expect(todoRes.body).toEqual({
      result: 'ok',
      data: {
        id,
        content: 'content',
        done: 0,
      },
    });
  });

  test('should fail to create todo', async () => {
    await request.post('/todos').set(commonHeader).send().expect(400);
  });

  test('should update todo', async () => {
    const createTodoRes = await request
      .post('/todos')
      .set(commonHeader)
      .send({
        content: 'content',
      })
      .expect(201);

    const {
      data: { id },
    } = createTodoRes.body;

    let updateTodoRes = await request
      .patch(`/todos/${id}`)
      .set(commonHeader)
      .send({
        content: 'content 1',
      })
      .expect(200);

    expect(updateTodoRes.body).toEqual({
      result: 'ok',
      data: {
        id,
        content: 'content 1',
        done: 0,
      },
    });

    updateTodoRes = await request
      .patch(`/todos/${id}`)
      .set(commonHeader)
      .send({
        done: 1,
      })
      .expect(200);

    expect(updateTodoRes.body).toEqual({
      result: 'ok',
      data: {
        id,
        content: 'content 1',
        done: 1,
      },
    });

    updateTodoRes = await request
      .patch(`/todos/${id}`)
      .set(commonHeader)
      .send({
        content: 'content 2',
        done: 0,
      })
      .expect(200);

    expect(updateTodoRes.body).toEqual({
      result: 'ok',
      data: {
        id,
        content: 'content 2',
        done: 0,
      },
    });

    await request.patch(`/todos/${id}`).set(commonHeader).expect(400);
  });

  test('should fail to create todo', async () => {
    const createTodoRes = await request
      .post('/todos')
      .set(commonHeader)
      .send({
        content: 'content',
      })
      .expect(201);

    const {
      data: { id },
    } = createTodoRes.body;

    await request.patch(`/todos/${id}`).set(commonHeader).expect(400);
  });

  test('should delete todo', async () => {
    const createTodoRes = await request
      .post('/todos')
      .set(commonHeader)
      .send({
        content: 'content',
      })
      .expect(201);

    const {
      data: { id },
    } = createTodoRes.body;

    await request.get(`/todos/${id}`).set(commonHeader).expect(200);
    await request.delete(`/todos/${id}`).set(commonHeader).expect(200);
    await request.get(`/todos/${id}`).set(commonHeader).expect(404);
  });

  test('should get latest 10 todos', async () => {
    let latestId = 0;

    for (let i = 0; i < 10; i++) {
      const createTodoRes = await request
        .post('/todos')
        .set(commonHeader)
        .send({
          content: 'content',
        })
        .expect(201);

      latestId = createTodoRes.body.data.id;
    }

    const todosRes = await request.get('/todos').set(commonHeader).expect(200);

    expect(todosRes.body.result).toBe('ok');
    expect(todosRes.body.data.length).toBe(10);

    for (const todo of todosRes.body.data) {
      expect(todo.id).toBe(latestId);
      latestId--;
    }
  });

  test('should get latest 5 todos', async () => {
    let latestId = 0;

    for (let i = 0; i < 5; i++) {
      const createTodoRes = await request
        .post('/todos')
        .set(commonHeader)
        .send({
          content: 'content',
        })
        .expect(201);

      latestId = createTodoRes.body.data.id;
    }

    const todosRes = await request
      .get('/todos')
      .query({
        limit: 5,
      })
      .set(commonHeader)
      .expect(200);

    expect(todosRes.body.result).toBe('ok');
    expect(todosRes.body.data.length).toBe(5);

    for (const todo of todosRes.body.data) {
      expect(todo.id).toBe(latestId);
      latestId--;
    }
  });

  test('should get todos with page', async () => {
    let latestId = 0;

    for (let i = 0; i < 4; i++) {
      const createTodoRes = await request
        .post('/todos')
        .set(commonHeader)
        .send({
          content: 'content',
        })
        .expect(201);

      latestId = createTodoRes.body.data.id;
    }

    let todosRes = await request
      .get('/todos')
      .query({
        page: 1,
        limit: 2,
      })
      .set(commonHeader)
      .expect(200);

    expect(todosRes.body.result).toBe('ok');
    expect(todosRes.body.data.length).toBe(2);

    for (const todo of todosRes.body.data) {
      expect(todo.id).toBe(latestId);
      latestId--;
    }

    todosRes = await request
      .get('/todos')
      .query({
        page: 2,
        limit: 2,
      })
      .set(commonHeader)
      .expect(200);

    expect(todosRes.body.result).toBe('ok');
    expect(todosRes.body.data.length).toBe(2);

    for (const todo of todosRes.body.data) {
      expect(todo.id).toBe(latestId);
      latestId--;
    }
  });
});
