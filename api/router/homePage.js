
// CORE
import express from 'express';
import pageController from '../controller/pageController.js';

const router = express.Router();

router.get('/', pageController.getIndex);
router.get('/admin.html', pageController.getAdmin);
router.get('/coursepage.html', pageController.getCoursePage);
router.get('/errorpage.html', pageController.getErrorPage);
router.get('/information.html', pageController.getInformation);
router.get('/login.html', pageController.getLogin);
router.get('/profile.html', pageController.getProfile);
router.get('/purchase.html', pageController.getPurchase);
router.get('/register.html', pageController.getRegister);

export default router;
