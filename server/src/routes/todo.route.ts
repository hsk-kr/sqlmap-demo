import express from 'express';
import authenticate from '../middlewares/auth.middleware';
const router = express.Router();

router.use(authenticate);

router
  .route('/')
  .post((req, res) => {
    res.send('create todo');
  })
  .get((req, res) => {
    res.send('get todos ' + res.locals.userId); // printing locals variables test
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
