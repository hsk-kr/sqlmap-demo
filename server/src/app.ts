import express from 'express';
import { initDatabase } from './config/db';
import { loadEnv } from './config/env';
import routes from './routes';

loadEnv();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

// routes
for (const [key, value] of Object.entries(routes)) {
  app.use(key, value);
}

app.listen(PORT, () => {
  initDatabase();
  console.log(`Server is listening on ${PORT}`);
});
