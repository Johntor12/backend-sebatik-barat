import express, { NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { Request, Response } from 'express';
import { HttpError } from './api/utils/HttpError';
import { connectDatabase } from './api/prisma/connectDatabase';
import authRoutes from "./api/routes/authRoutes";
import beritaRoutes from "./api/routes/beritaRoutes";
import dotenv from 'dotenv';
// import { runSeeders } from './prisma/seed';

// runSeeders();

dotenv.config();

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get('/', (req, res) => {
  res.send('API Backend Taka Sebatik 2025');
});

app.use('/api/auth', authRoutes);
app.use('/news', beritaRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new HttpError("Not Found", 404));
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
      },
    });
  }

  console.error(err);
  res.status(500).json({
    error: {
      message: "Internal Server Error",
    },
  });
})
  

async function startServer() {
  try {
    await connectDatabase(); // Tunggu koneksi database dulu
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to DB", err);
    process.exit(1);
  }
}

startServer();