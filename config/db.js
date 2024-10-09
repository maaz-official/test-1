import mongoose from 'mongoose';

// MongoDB URI - replace this with your own connection string
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/sports_events'; // Default to local if not specified

// Function to connect to the database
export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit the process with failure
  }
};
