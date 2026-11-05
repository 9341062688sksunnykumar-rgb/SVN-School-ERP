import app from "./app";
import { logger } from "./lib/logger";
import { prepareAdminLogin } from "./lib/prepare-admin";

const port = Number(process.env.PORT);
if (!Number.isInteger(port) || port <= 0) {
  throw new Error('A valid PORT environment variable is required.');
}

async function start() {
  await prepareAdminLogin();
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, 'Error listening on port');
      process.exit(1);
    }
    logger.info({ port }, 'Server listening');
  });
}
start().catch((err) => {
  logger.error({ err }, 'Database initialization failed');
  process.exit(1);
});
