import { api } from './api.js';
import {mergeItems} from './helper.js'

/* =========================
   CONSTANTS
========================= */

const STORAGE_KEY_USERS = "cp_users_v1";
const STORAGE_KEY_CURRENT = "cp_current_user_v1";

/* =========================
   INTERNAL STATE
========================= */

let users = [];
let currentUser = null;

/* =========================
   STORAGE HELPERS
========================= */

function loadFromStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}

async function saveUsers() {
  try { 
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    api.post('/users/sync', users); 
  } catch (e) {

  }
}

function saveCurrent() {
  try { localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(currentUser)); } catch (e) {}
}

/* =========================
   MERGE HELPERS
========================= */

function mergeUsers(existingUsers, newUsers) {
  const merged = [...existingUsers];
  const existingIds = new Set(existingUsers.map(u => u.id));

  newUsers.forEach(u => {
    if (!existingIds.has(u.id)) {
      merged.push(u);
    }
  });

  return merged;
}

/* =========================
   INIT
========================= */

function initLocalUsers() {
  users = loadFromStorage(STORAGE_KEY_USERS);
  if (!users || !Array.isArray(users)) {
    users = [
      { id: 1, name: "Beshnack", email: "Beshbesh@test.com", password: "1234", role: "admin", enrolledCourses: [] },
      { id: 2, name: "Mazen", email: "Mazenhany@test.com", password: "12345", role: "admin", enrolledCourses: [] },
      { id: 3, name: "Eltony", email: "gigachad@teste.com", password: "1234", role: "admin", enrolledCourses: [] },
    ];
    saveUsers();
  }

  currentUser = loadFromStorage(STORAGE_KEY_CURRENT) || null;
}

// Initialize on script load
initLocalUsers();

/* =========================
   API FETCH & MERGE
========================= */

export async function fetchAndMergeUsers(url) {
  try {
    const newUsers = await api.get(url);
    if (!Array.isArray(newUsers)) throw new Error("Invalid users payload");

    users = mergeItems(users, newUsers, 'id');
    saveUsers();
  } catch (e) {
    console.error("Failed to fetch users:", e);
  }
}

fetchAndMergeUsers('/users/')

/* =========================
   VALIDATION
========================= */

function _validateUserData(userData) {
  if (!userData) return "User data is required.";
  if (!userData.name) return "Name is required.";
  if (!userData.email) return "Email is required.";
  if (!userData.password) return "Password is required.";
  return null;
}

/* =========================
   AUTH API
========================= */

export function register(userData) {
  const v = _validateUserData(userData);
  if (v) return { ok: false, error: v };

  if (users.find(u => u.email === userData.email)) {
    return { ok: false, error: "Email already exists" };
  }

  const id = users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;

  const newUser = {
    id,
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role || "student",
    enrolledCourses: [],
    lastActive: new Date()
  };

  users.push(newUser);
  saveUsers();

  return { ok: true, user: newUser };
}

export function login(email, password) {
  if (!email || !password) return false;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return false;

  currentUser = { ...user };
  saveCurrent();
  return true;
}

export function logout() {
  currentUser = null;
  saveCurrent();
}

/* =========================
   GETTERS
========================= */

export function getRole() {
  return currentUser?.role || null;
}

export function getCurrentUser() {
  return currentUser;
}

export function getUser(userID) {
  return users.find(u => u.id == parseInt(userID));
}

export function listUsers() {
  return [...users];
}

/* =========================
   UPDATE USER
========================= */

export function updateUser(userToUpdate, newData) {
  if (!userToUpdate || !newData || Object.keys(newData).length === 0) {
    return { ok: false, error: "Invalid update payload." };
  }

  const idx = users.findIndex(u => u.id === userToUpdate.id);
  if (idx === -1) return { ok: false, error: "User not found." };

  users[idx] = { ...users[idx], ...newData, lastActive: new Date() };
  saveUsers();

  if (currentUser?.id === users[idx].id) {
    currentUser = { ...users[idx] };
    saveCurrent();
  }

  return { ok: true, user: currentUser };
}

/* =========================
   CLEANUP ENROLLMENTS
========================= */

export function cleanupUserEnrollments(courseId) {
  let changed = false;

  users.forEach(user => {
    user.enrolledCourses = user.enrolledCourses || [];
    const before = user.enrolledCourses.length;
    user.enrolledCourses = user.enrolledCourses.filter(id => id !== courseId);
    if (user.enrolledCourses.length < before) changed = true;
  });

  if (changed) saveUsers();
}
