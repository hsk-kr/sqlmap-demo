import express from 'express';
import { loadEnv } from './configs/env';
import { initDatabase } from './configs/db';
import routes from './routes';

loadEnv();

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
for (const [key, value] of Object.entries(routes)) {
  app.use(key, value);
}

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
