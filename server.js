import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDB } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();


app.use(cors());
app.use(bodyParser.json());

connectDB();

app.use('/users', routes.userRoutes);
app.use('/auth', routes.authRoutes);
// app.use('/events', routes.eventRoutes);
// app.use('/players', routes.playerRoutes);
// app.use('/hosts', routes.hostRoutes);
// app.use('/map', routes.mapRoutes);
// app.use('/notifications', routes.notificationRoutes);
// app.use('/reviews', routes.reviewRoutes);
// app.use('/leaderboard', routes.leaderboardRoutes);
// app.use('/analytics', routes.analyticsRoutes);
// app.use('/files', routes.fileUploadRoutes);
// app.use('/admin', routes.adminRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to the Sports Event API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
