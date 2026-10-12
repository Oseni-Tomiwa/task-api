import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

const startServer = async (): Promise<void> => {
  await connectDatabase(env.mongoUri);

  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
};

startServer().catch((error: unknown) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
