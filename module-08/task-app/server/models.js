import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  emailVerifiedAt: { type: Date, default: null },
  verificationTokenHash: { type: String, select: false, index: true },
  verificationExpiresAt: { type: Date, select: false },
  verificationSentAt: { type: Date, select: false },
  loginChallenge: { type: String, select: false },
  loginCodeHash: { type: String, select: false },
  loginCodeExpiresAt: { type: Date, select: false },
  loginCodeSentAt: { type: Date, select: false },
  loginCodeAttempts: { type: Number, default: 0, select: false }
}, { timestamps: true });
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  completed: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });
export const User = mongoose.model('User', userSchema);
export const Task = mongoose.model('Task', taskSchema);
