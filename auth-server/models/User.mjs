import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const FavoriteSchema = new mongoose.Schema({
  movieId: { type: Number, required: true },
  title: String,
  posterPath: String,
  releaseDate: String,
  voteAverage: Number,
  overview: String,
  reminderEnabled: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  pushToken: {
    type: String,
    default: null
  },
  notificationPreferences: {
    releaseReminders: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: String,
      default: '09:00', // Default to 9 AM
      enum: ['09:00', '12:00', '18:00', '21:00']
    }
  },
  favorites: [FavoriteSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to get user without sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
