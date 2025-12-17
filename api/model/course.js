import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    students: {
      type: [[mongoose.Schema.Types.Mixed]], // array of arrays
      default: [],
      validate: {
        validator: function(arr) {
          // Ensure each inner array is [number, string]
          return arr.every(
            item => Array.isArray(item) &&
                    item.length === 2 &&
                    typeof item[0] === 'number' &&
                    typeof item[1] === 'string'
          );
        },
        message: "Each student must be [number, string]"
      }
    },
    categories: [ { type: String, lowercase: true, trim: true }],
    visits: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 },
    duration: { type: String, required: true },
  },
  { 
    versionKey: false
  }
);

// Hide _id in API responses
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