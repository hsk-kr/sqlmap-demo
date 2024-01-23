import express from 'express';
import authenticate from '../middlewares/auth.middleware';
import {
  createTodo,
  deleteTodo,
  getTodo,
  getTodos,
  updateTodo,
} from '../controllers/todos.controller';
const router = express.Router();

router.use(authenticate);

router.route('/').post(createTodo).get(getTodos);

router.route('/:todoId').patch(updateTodo).get(getTodo).delete(deleteTodo);

export default router;
