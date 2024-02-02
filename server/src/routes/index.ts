import auth from './auth.route';
import todo from './todo.route';
import vulnerability from './vulnerability.route';

const routes = {
  '/auth': auth,
  '/todos': todo,
  '/vulnerability': vulnerability,
};

export default routes;
