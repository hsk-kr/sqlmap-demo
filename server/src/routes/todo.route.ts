import express from 'express';
const router = express.Router();

router
  .route('/')
  .post((req, res) => {
    res.send('create todo');
  })
  .get((req, res) => {
    res.send('get todos ');
  });

router
  .route('/:todoId')
  .patch((req, res) => {
    res.send('patch todo');
  })
  .get((req, res) => {
    res.send('get todo ');
  })
  .delete((req, res) => {
    res.send('delete todo ');
  });

export default router;
