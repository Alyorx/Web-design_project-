import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    lastActive: { type: String },
  },
  {
    versionKey: false
  }
);

export default mongoose.model('User', userSchema);