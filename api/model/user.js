import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    enrolledCourses: [{ type: Number, required: true }],
    lastActive: { type: String },
  },
  {
    versionKey: false
  }
);

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  }
});

userSchema.set("toObject", {
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  }
});

export default mongoose.model('User', userSchema);