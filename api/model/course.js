import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    enrolled: { type: Number, default: 0, min: 0 },
    status: { type: String, required: true, enum: ["Pending", "Approved"], default: "Pending" },
    duration: { type: String, required: true },
    students: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    categories: {
      type: [String],
      default: [],
      lowercase: true,
      trim: true
    },
    visits: { type: Number, default: 0, min: 0 }
  },
  { versionKey: false }
);

courseSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  }
});

courseSchema.set("toObject", {
  transform: (doc, ret) => {
    delete ret._id;
    return ret;
  }
});

export default mongoose.model('Course', courseSchema);