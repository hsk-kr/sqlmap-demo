import express from 'express';
import authenticate from '../middlewares/auth.middleware';
import {
  craeteTodo,
  deleteTodo,
  getTodo,
  getTodos,
  updateTodo,
} from '../controllers/todos.controller';
const router = express.Router();

router.use(authenticate);

router.route('/').post(craeteTodo).get(getTodos);

router.route('/:todoId').patch(updateTodo).get(getTodo).delete(deleteTodo);

export default router;
