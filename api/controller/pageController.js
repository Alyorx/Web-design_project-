import path from 'path';
import { fileURLToPath } from 'url';

// ESM dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute pages directory
const PAGES_PATH = path.resolve(__dirname, '../../src/pages');

const getHtmlFile = (fileName) => (req, res) => {
  res.sendFile(path.join(PAGES_PATH, fileName));
};

const pageController = {
  getIndex: getHtmlFile('index.html'),
  getAdmin: getHtmlFile('admin.html'),
  getCoursePage: getHtmlFile('coursepage.html'),
  getErrorPage: getHtmlFile('errorpage.html'),
  getInformation: getHtmlFile('information.html'),
  getLogin: getHtmlFile('login.html'),
  getProfile: getHtmlFile('profile.html'),
  getPurchase: getHtmlFile('purchase.html'),
  getRegister: getHtmlFile('register.html'),
};

export default pageController;
