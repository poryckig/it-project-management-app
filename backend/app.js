import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './routes/router.js';

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  })
);

app.use('/api/v1', router);

app.use((req, res, next) => {
    res.status(404).json({
      success: false,
      message: 'Page not found',
    });
  });

export default app;