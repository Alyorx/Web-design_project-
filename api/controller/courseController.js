import Course from '../model/course.js'

const getAllCourses = async (req, res) => {
  try {
    // Just use the Model directly. Mongoose knows it's connected.
    const courses = await Course.find({});
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

const addCourse = async (req, res) => {
  try {
    const { id, title, description, instructor, students, categories, visits, price, duration } = req.body;

    // Validate required fields
    if (!title || !instructor || !id) {
      return res.status(400).json({ error: 'Id, Instructor, Title are required' });
    }

    // 3. Mongoose handles the connection in the background automatically
    const newCourse = new Course({
      id,
      title,
      description,
      instructor,
      students: students || [],
      categories: categories || [],
      visits: visits || 0,
      price: price || 0,
      duration: duration || 0,
    });

    // 4. This sends the data to the 'users' collection defined in your Model
    const savedCourse = await newCourse.save();

    res.status(201).json({
      message: 'Course created successfully',
      course: savedCourse,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return res.status(400).json({ error: 'ID already exists' });
    }

    res.status(500).json({ error: 'Server error' });
  }
}

const syncCourses = async (req, res) => {
  try {
    const courses = req.body;

    // Validate input
    if (!Array.isArray(courses)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array"
      });
    }

    if (courses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Nothing to sync",
        result: { matched: 0, upserted: 0 }
      });
    }

    // Build bulk ops
    const ops = courses.map(course => ({
      updateOne: {
        filter: { id: course.id },
        update: { $set: course },
        upsert: true
      }
    }));

    // Execute
    const result = await Course.bulkWrite(ops);

    return res.status(200).json({
      success: true,
      message: "Sync completed",
      result: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Sync failed",
      error: err.message
    });
  }
}

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.body;

    // Validate input
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide id to delete the course"
      });
    }

    // Delete user
    const result = await Course.deleteOne({ id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully"
    });

  } catch (error) {
    console.error("Delete course error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete course",
      error: error.message
    });
  }
}


const course = {
  getAllCourses,
  addCourse,
  syncCourses,
  deleteCourse,
};

export default course;