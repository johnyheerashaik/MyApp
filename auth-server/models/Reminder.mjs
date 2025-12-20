import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: Number, required: true },
  reminderEnabled: { type: Boolean, default: true },
  reminderSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

ReminderSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.model('Reminder', ReminderSchema);