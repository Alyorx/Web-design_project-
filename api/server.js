// Bootstrap
import 'dotenv/config';

// Core
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// App modules
import connectDB from './config/config.js';
import homePage from './router/homePage.js';
import userRouter from './router/userRouter.js';
// import courseRouter from './router/courseRouter.js';
// import progressRouter from './router/progressRouter.js';

// ESM dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App
const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../src')));

// Routes (uncomment when ready)
app.use('/', homePage);
app.use('/api/users', userRouter);
// app.use('/api/courses', courseRouter);
// app.use('/api/progress', progressRouter);

// Startup
(async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
})();
