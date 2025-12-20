import { cleanupCourseData } from './progressSystem.js';
import { listUsers, updateUser } from "./userSystem.js";
import { api } from './api.js';
import {mergeItems} from './helper.js'

const STORAGE_KEY_COURSES = "cp_courses_v1";

/* =========================
   INTERNAL STATE
========================= */

export let courseList = loadCourses() || [];

/* =========================
   STORAGE HELPERS
========================= */

function loadCourses() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_COURSES)) || [];
  } catch (e) {
    return [];
  }
}

async function saveCourses() {
  try {
    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courseList));
    // Optional backend sync
    api.post('/courses/sync', JSON.stringify(courseList)).catch(console.error);
  } catch (e) {}
}

/* =========================
   MERGE HELPERS
========================= */

function mergeCourses(existing, incoming) {
  const merged = [...existing];
  const existingIds = new Set(existing.map(c => c.id));
  incoming.forEach(c => {
    if (!existingIds.has(c.id)) merged.push(c);
  });
  return merged;
}

/* =========================
   API FETCH & MERGE
========================= */

export async function fetchAndMergeCourses(url) {
  try {
    const newCourses = await api.get(url);
    if (!Array.isArray(newCourses)) throw new Error("Invalid courses payload");

    courseList = mergeItems(courseList, newCourses, 'id');
    saveCourses();
  } catch (e) {
    console.error("Failed to fetch courses:", e);
  }
}

fetchAndMergeCourses('/courses/');

/* =========================
   UTILITIES
========================= */

function _findCourseIndex(id) {
  return courseList.findIndex(c => c.id === id);
}

function _generateUniqueCourseId() {
  if (courseList.length === 0) return 1;
  return Math.max(...courseList.map(c => c.id)) + 1;
}

/* =========================
   CRUD OPERATIONS
========================= */

export function createCourse(course) {
  if (!course || !course.title) return null;
  const newCourse = {
    ...course,
    id: _generateUniqueCourseId(),
    students: course.students || [],
    categories: course.categories || [],
    visits: course.visits || 0,
    price: course.price || 0,
    duration: course.duration || "N/A"
  };
  courseList.push(newCourse);
  saveCourses();
  return newCourse;
}

export function editCourse(id, data) {
  const idx = _findCourseIndex(id);
  if (idx === -1) return null;

  if (data.categories) {
    data.categories = Array.isArray(data.categories) ? data.categories : [];
    const oldCategories = courseList[idx].categories || [];
    data.categories = [...new Set([...oldCategories, ...data.categories])];
  }

  courseList[idx] = { ...courseList[idx], ...data };
  saveCourses();
  return courseList[idx];
}

export async function deleteCourse(id) {
  const idx = _findCourseIndex(id);
  if (idx === -1) return false;
  courseList.splice(idx, 1);
  api.delete('/courses/delete', {id})
  saveCourses();
  return true;
}

export function getCourse(id) {
  return courseList.find(c => c.id === id) || null;
}

export function listCourses() {
  return [...courseList];
}

export function incrementVisits(courseId) {
  const c = getCourse(courseId);
  if (!c) return null;
  c.visits = (c.visits || 0) + 1;
  saveCourses();
  return c.visits;
}

/* =========================
   ANALYTICS
========================= */

export function getAnalytics() {
  const totalCourses = courseList.length;
  const totalEnrollments = courseList.reduce((acc, c) => acc + (c.students?.length || 0), 0);
  const topCourses = [...courseList].sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0)).slice(0, 3);
  const topVisited = [...courseList].sort((a, b) => (b.visits || 0) - (a.visits || 0)).slice(0, 3);
  return { totalCourses, totalEnrollments, topCourses, topVisited };
}

/* =========================
   ENROLLMENT
========================= */

export function enrollUser(userId, courseId) {
  const c = getCourse(courseId);
  if (!c) return false;
  c.students = c.students || [];
  if (c.students.some(s => s[0] === userId)) return false;
  c.students.push([userId, new Date().toISOString()]);
  saveCourses();
  return true;
}

/* =========================
   SEARCH
========================= */

export function searchCoursesByCategory(category) {
  if (!category || typeof category !== "string") return [];
  return courseList.filter(c => c.categories && c.categories.includes(category));
}

/* =========================
   CLEANUP & DELETION
========================= */

export function courseDeletion(courseId) {
  const courseDeleted = deleteCourse(courseId);
  if (!courseDeleted) return false;

  cleanupCourseData(courseId);

  const students = listUsers().filter(u => u.role === "student");
  students.forEach(student => {
    const remainingCourses = student.enrolledCourses.filter(course => String(course) !== String(courseId));
    updateUser(student, { enrolledCourses: remainingCourses });
  });

  return true;
}

/* =========================
   RESET (for testing)
========================= */

export function resetAllCourses() {
  courseList = [];
  localStorage.removeItem(STORAGE_KEY_COURSES);
}