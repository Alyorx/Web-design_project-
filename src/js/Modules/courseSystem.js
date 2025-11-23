  // Course System module:
//  createCourse, editCourse, deleteCourse, getCourse, listCourses, getAnalytics, enrollUser, searchCoursesByCategory, incrementVisits

const STORAGE_KEY_COURSES = "cp_courses_v1";

export let courseList = loadCourses() || [
  {
    id: 1,
    title: "Multimedia Basics",
    description: "Intro to multimedia",
    instructor: "Jana",
    students: [],
    categories: ["multimedia", "basics"], // replaced tags → categories
    visits: 0,
    price: 200,
    duration: "3 Weeks"
  },
  {
    id: 2,
    title: "Graphic Design",
    description: "Basics of GD",
    instructor: "Sama",
    students: [],
    categories: ["graphic", "design"], 
    visits: 0,
    price: 250,
    duration: "4 Weeks"
  }
];

function loadCourses() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_COURSES)) || []; } catch (e) { return []; }
}

function saveCourses() {
  try { localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courseList)); } catch (e) { /*ignore*/ }
}

function _findCourseIndex(id) {
  return courseList.findIndex(c => c.id === id);
}

// NEW Helper Function: Generates the next available unique ID 
function _generateUniqueCourseId() {
  if (courseList.length === 0) {
    return 1;
  }
  // Find the max ID currently in the list and add 1
  const maxId = Math.max(...courseList.map(c => c.id));
  return maxId + 1;
}

// Create new course (MODIFIED)
export function createCourse(course) {
  // Removed the check for course.id in the incoming data
  if (!course || !course.title) {
    console.log("%c❌ createCourse: course must have a title", "color:red;");
    return null;
  }
  
  // No longer checking for existing ID, since we generate a unique one
  const newId = _generateUniqueCourseId(); 

  const newCourse = {
    ...course,
    id: newId, // Use the newly generated ID
    students: course.students || [],
    categories: course.categories || [],
    visits: course.visits || 0,
    price: course.price || 0,
    duration: course.duration || "N/A"
  };
  
  courseList.push(newCourse);
  saveCourses();
  console.log(`%c✅ Course created: ${newCourse.title} (id:${newId})`, "color:green; font-weight:bold;");
  return newCourse;
}

// Edit course
export function editCourse(id, data) {
  const idx = _findCourseIndex(id);
  if (idx === -1) {
    console.log("%c❌ editCourse: course not found", "color:red;");
    return null;
  }

  if (data.categories) {
    data.categories = Array.isArray(data.categories) ? data.categories : [];
    const oldCategories = courseList[idx].categories || [];
    data.categories = [...new Set([...oldCategories, ...data.categories])];
  }

  courseList[idx] = { ...courseList[idx], ...data };
  saveCourses();
  console.log(`%c Course updated: id ${id}`, "color:blue;");
  return courseList[idx];
}

// Delete course
export function deleteCourse(id) {
  const idx = _findCourseIndex(id);
  if (idx === -1) {
    console.log("%c❌ deleteCourse: course not found", "color:red;");
    return false;
  }
  const removed = courseList.splice(idx, 1)[0];
  saveCourses();
  console.log(`%c Course deleted: ${removed.title} (id:${id})`, "color:orange;");
  return true;
}

// Get course
export function getCourse(id) {
  return courseList.find(c => c.id === id) || null;
}

//  List all courses
export function listCourses() {
  console.log("%c Course list:", "color:blue; font-weight:bold;", courseList);
  return courseList;
}

// Increment course visits
export function incrementVisits(courseId) {
  const c = getCourse(courseId);
  if (!c) {
    console.log("%c❌ incrementVisits: course not found", "color:red;");
    return null;
  }
  c.visits = (c.visits || 0) + 1;
  saveCourses();
  console.log(` Visits for ${c.title}: ${c.visits}`);
  return c.visits;
}

//  Analytics: total courses, total enrollments, top visited
export function getAnalytics() {
  const totalCourses = courseList.length;
  const totalEnrollments = courseList.reduce((acc, c) => acc + (c.students?.length || 0), 0);
  const topCourses = [...courseList]
    .sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0))
    .slice(0, 3);

  const topVisited = [...courseList]
    .sort((a, b) => (b.visits || 0) - (a.visits || 0))
    .slice(0, 3);

  const result = { totalCourses, totalEnrollments, topCourses, topVisited };
  console.log("%c Course analytics:", "color:purple; font-weight:bold;", result);
  return result;
}

// Enroll user
export function enrollUser(userId, courseId) {
  const c = getCourse(courseId);
  if (!c) {
    console.log("%c❌ enrollUser: course not found", "color:red;");
    return false;
  }
  c.students = c.students || [];
  if (c.students.some(s => s[0] === userId)) { // Changed check to handle the array structure [userId, date]
    console.log("%c User already enrolled", "color:gray;");
    return false;
  }
  c.students.push([userId, new Date().toISOString()]); // Added ISOString for better format
  saveCourses();
  console.log(`%c✅ User ${userId} enrolled to course ${courseId}`, "color:green;");
  return true;
}

// Search courses by category
export function searchCoursesByCategory(category) {
  if (!category || typeof category !== "string") return [];
  return courseList.filter(c => c.categories && c.categories.includes(category));
}

//  Helper for testing/cleanup 
export function resetAllCourses() {
    courseList = [];
    localStorage.removeItem(STORAGE_KEY_COURSES);
    console.log("%c All courses reset and removed from localStorage.", "color:red; font-weight:bold;");
}
