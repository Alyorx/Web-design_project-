import express from 'express';
const router = express.Router();
import userController from '../controller/userController.js';

router.get('/', userController.getAllUsers);
router.post('/users', userController.addUser);
router.post('/sync', userController.syncUsers);
router.delete('/delete', userController.deleteUser);

export default router;
