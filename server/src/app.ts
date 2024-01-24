import express from 'express';
import { loadEnv } from './configs/env';
import { initDatabase } from './configs/db';
import routes from './routes';

loadEnv();

const app = express();
const PORT = process.env.PORT ?? 3000;
const TEST_URL = process.env.TEST_URL ?? `http://localhost:${PORT}`;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
for (const [key, value] of Object.entries(routes)) {
  app.use(key, value);
}

if (process.env.NODE_ENV !== 'test') {
  initDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server is listening on ${PORT}`);
      });
    })
    .catch((err) => {
      console.error(err);
    });
}

export { app, TEST_URL };
export default app;
