import app from './app';
import { config } from './config';
import { connectToDatabase } from './db';

const start = async () => {
  try {
    await connectToDatabase();
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

start();
