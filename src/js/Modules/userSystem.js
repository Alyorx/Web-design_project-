// User System module:
//  register, login, logout, getRole, helpers
const STORAGE_KEY_USERS = "cp_users_v1";
const STORAGE_KEY_CURRENT = "cp_current_user_v1";

// Load users from LocalStorage
let users = loadFromStorage(STORAGE_KEY_USERS);
if (!users || users.length === 0) {
  // Only add default user if storage is empty   
  users = [
    { id: 1, name: "Beshnack", email: "Beshbesh@test.com", password: "1234", role: "admin" },
    { id: 2, name: "Mazen", email: "Mazenhany@test.com", password: "12345", role: "admin" },
    { id: 3, name: "Eltony", email: "gigachad@teste.com", password: "1234", role: "admin" },
  ];
  saveUsers(); // save immediately to storage
}

// Load current user
let currentUser = loadFromStorage(STORAGE_KEY_CURRENT) || null;

function saveUsers() {
  try { localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users)); } catch (e) {/* ignore */ }
}
function saveCurrent() {
  try { localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(currentUser)); } catch (e) {/* ignore */ }
}
function loadFromStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}

// Simple validator
function _validateUserData(userData) {
  if (!userData) return "User data is required.";
  if (!userData.name) return "Name is required.";
  if (!userData.email) return "Email is required.";
  if (!userData.password) return "Password is required.";
  return null;
}

// Register a new user
export function register(userData) {
  const v = _validateUserData(userData);
  if (v) {
    console.log("%c❌ Register error: " + v, "color:red; font-weight:bold;");
    return { ok: false, error: v };
  }
  if (users.find(u => u.email === userData.email)) {
    console.log("%c❌ Register error: Email already exists", "color:red; font-weight:bold;");
    return { ok: false, error: "Email already exists" };
  }
  const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const newUser = { id, name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role || "student",
    enrolledCourses: [],
    lastActive: new Date()
 };
  users.push(newUser);
  saveUsers();
  console.log(`%c User registered: ${newUser.name} (${newUser.email})`, "color:green; font-weight:bold;");
  return { ok: true, user: newUser };
}

// Login
export function login(email, password) {
  if (!email || !password) { console.log("%c❌ Login error: Missing credentials", "color:red;"); return false; }
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) { console.log("%c❌ Invalid credentials", "color:red;"); return false; }
  currentUser = { ...user };
  saveCurrent();
  console.log(`%c Logged in: ${user.name}`, "color:blue; font-weight:bold;");
  return true;
}

// Logout
export function logout() {
  if (!currentUser) { console.log("%c No user logged in", "color:gray;"); return; }
  console.log(`%c Logged out: ${currentUser.name}`, "color:orange;");
  currentUser = null;
  saveCurrent();
}

// Get role of current user
export function getRole() {
  return currentUser?.role || null;
}

// Get currently logged user
export function getCurrentUser() {
  return currentUser;
}

// Get User by ID
export function getUser(userID){
  return users.find((v) => v.id == parseInt(userID));
}

// Admin helper: list users (no auth in demo)
export function listUsers() {
  console.log("%c Users:", "color:blue; font-weight:bold;", users);
  return users;
}

/**
 * Updates the user data in the users array and the currentUser state
 * @param {object} userToUpdate - The currently logged in user object (from getCurrentUser())
 * @param {object} newData - The new data fields to be merged into the user object ({name: "New Name"})
 */
export function updateUser(userToUpdate, newData) {
  if (!userToUpdate || !newData) {
    return { ok: false, error: "Missing user or new data." };
  }
  
  if (Object.keys(newData).length === 0) {
      console.log("%c Update error: New data object is empty", "color:red; font-weight:bold;");
      return { ok: false, error: "New data object is empty" };
}
  
  // (users array data)
  const userIndex = users.findIndex(u => u.id === userToUpdate.id);

  if (userIndex === -1) {
    console.log("%c Update error: User not found in array", "color:red; font-weight:bold;");
    return { ok: false, error: "User not found." };
  }


  const updatedUser = {
    ...users[userIndex],
    ...newData
  };

  users[userIndex] = updatedUser;
  saveUsers();

  // (currentUser)
  currentUser = { ...updatedUser }; 
  saveCurrent();

  console.log(`%c User updated: ${updatedUser.name} (${updatedUser.email})`, "color:green; font-weight:bold;");

  return { ok: true, user: currentUser } };

/**
 * Removes a deleted course ID from the enrolledCourses array of all users
 * @param {number} courseId  The ID of the course that was deleted
 */
export function cleanupUserEnrollments(courseId) {
    let updated = false;

    // Iterate over all registered users in memory
    users.forEach(user => {
        user.enrolledCourses = user.enrolledCourses || []; 
        
        const initialLength = user.enrolledCourses.length;
        
        // Filter the array: Create a new list that excludes the ID of the deleted course
        user.enrolledCourses = user.enrolledCourses.filter(id => id !== courseId);
        
        // Check if any ID was actually removed (to avoid unnecessary saving)
        if (user.enrolledCourses.length < initialLength) {
            updated = true;
        }
    });

    // If at least one ID was removed from any user, save the updated user list to storage
    if (updated) {
        saveUsers(); 
        console.log(`%c Cleaned up enrollment records for course ID: ${courseId}`, "color:purple;");
    }
}
