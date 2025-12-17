import User from '../model/user.js'

const getAllUsers = async (req, res) => {
	try {
		// Just use the Model directly. Mongoose knows it's connected.
		const users = await User.find({});
		res.status(200).json(users);
	} catch (err) {
		res.status(500).json({ error: 'Server Error' });
	}
};

const addUser = async (req, res) => {
	try {
		const { _id, name, email, password, role, lastActive } = req.body;

		// Validate required fields
		if (!name || !email || !password) {
			return res.status(400).json({ error: 'Name, email, and password are required' });
		}

		// 3. Mongoose handles the connection in the background automatically
		const newUser = new User({
			_id,
			name,
			email,
			password,
			role: role || 'user',
			lastActive: lastActive || new Date().toISOString()
		});

		// 4. This sends the data to the 'users' collection defined in your Model
		const savedUser = await newUser.save();

		res.status(201).json({
			message: 'User created successfully',
			user: savedUser,
		});
	} catch (err) {
		console.error(err);

		if (err.code === 11000) {
			return res.status(400).json({ error: 'Email already exists' });
		}

		res.status(500).json({ error: 'Server error' });
	}
}

const syncUsers = async (req, res) => {
	try {
		const users = req.body;

		// Validate input
		if (!Array.isArray(users)) {
			return res.status(400).json({
				success: false,
				message: "Request body must be an array"
			});
		}

		if (users.length === 0) {
			return res.status(200).json({
				success: true,
				message: "Nothing to sync",
				result: { matched: 0, upserted: 0 }
			});
		}

		// Build bulk ops
		const ops = users.map(user => ({
			updateOne: {
				filter: { _id: user._id },
				update: { $set: user },
				upsert: true
			}
		}));

		// Execute
		const result = await User.bulkWrite(ops);

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

const deleteUser = async (req, res) => {
  try {
    const { id, email } = req.body;

    // Validate input
    if (!id && !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide _id or email to delete the user"
      });
    }

    // Build query
    const query = id ? { _id: id } : { email: email };

    // Delete user
    const result = await User.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
}


const user = {
	getAllUsers,
	addUser,
	syncUsers,
	deleteUser,
};

export default user;
