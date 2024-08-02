import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import identifyRouter from './routes/identify';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const uri = "mongodb+srv://watto:EGZFuG8nI1CE4yhT@cluster0.tz7kuxn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri).then(() => {
  console.log('Connected to MongoDB');
}).catch(error => {
  console.error('Error connecting to MongoDB', error);
});

// Routes
app.use('/', identifyRouter);

// Global error handling middleware with explicit types
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
