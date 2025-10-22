
// Course System module:
//  createCourse, editCourse, deleteCourse, getCourse, listCourses, getAnalytics, enrollUser, searchCoursesByTag

const STORAGE_KEY_COURSES = "cp_courses_v1";
export let courseList = loadCourses() || [
  {
    id: 101,
    title: "Multimedia Basics",
    description: "Intro to multimedia",
    instructor: "Jana",
    students: [],
    tags: ["multimedia", "basics"]
  },
  {
    id: 102,
    title: "Graphic Design",
    description: "Basics of GD",
    instructor: "sama",
    students: [],
    tags: ["graphic", "design"]
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

export function createCourse(course) {
  if (!course || !course.id || !course.title) {
    console.log("%c❌ createCourse: course must have id and title", "color:red;");
    return null;
  }
  if (courseList.find(c => c.id === course.id)) {
    console.log("%c❌ createCourse: course id already exists", "color:red;");
    return null;
  }
  courseList.push({ ...course, students: course.students || [], tags: course.tags || [] });
  saveCourses();
  console.log(`%c✅ Course created: ${course.title} (id:${course.id})`, "color:green; font-weight:bold;");
  return course;
}

export function editCourse(id, data) {
  const idx = _findCourseIndex(id);
  if (idx === -1) { console.log("%c❌ editCourse: course not found", "color:red;"); return null; }

  if (data.tags) {
    data.tags = Array.isArray(data.tags) ? data.tags : [];
    const oldTags = courseList[idx].tags || [];
    data.tags = [...new Set([...oldTags, ...data.tags])];
  }

  courseList[idx] = { ...courseList[idx], ...data };
  saveCourses();
  console.log(`%c Course updated: id ${id}`, "color:blue;");
  return courseList[idx];
}

export function deleteCourse(id) {
  const idx = _findCourseIndex(id);
  if (idx === -1) { console.log("%c❌ deleteCourse: course not found", "color:red;"); return false; }
  const removed = courseList.splice(idx, 1)[0];
  saveCourses();
  console.log(`%c Course deleted: ${removed.title} (id:${id})`, "color:orange;");
  return true;
}

export function getCourse(id) {
  return courseList.find(c => c.id === id) || null;
}

export function listCourses() {
  console.log("%c Course list:", "color:blue; font-weight:bold;", courseList);
  return courseList;
}

// simple analytics: total courses, total enrollments
export function getAnalytics() {
  const totalCourses = courseList.length;
  const totalEnrollments = courseList.reduce((acc, c) => acc + (c.students?.length || 0), 0);
  const topCourses = [...courseList].sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0)).slice(0, 3);
  const result = { totalCourses, totalEnrollments, topCourses };
  console.log("%c Course analytics:", "color:purple; font-weight:bold;", result);
  return result;
}

// enroll a user to course (simple)
export function enrollUser(userId, courseId) {
  const c = getCourse(courseId);
  if (!c) { console.log("%c❌ enrollUser: course not found", "color:red;"); return false; }
  c.students = c.students || [];
  if (c.students.includes(userId)) { console.log("%c⚠ User already enrolled", "color:gray;"); return false; }
  c.students.push(userId);
  saveCourses();
  console.log(`%c✅ User ${userId} enrolled to course ${courseId}`, "color:green;");
  return true;
}

// Search courses by tag
export function searchCoursesByTag(tag) {
  if (!tag || typeof tag !== "string") return [];
  return courseList.filter(c => c.tags && c.tags.includes(tag));
}