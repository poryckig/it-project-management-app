import dotenv from 'dotenv';
import { checkConnectionToDB } from './db/db.js';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = () => {
  checkConnectionToDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

server();