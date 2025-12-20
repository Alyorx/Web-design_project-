import { getCourse } from "./courseSystem.js";
import { CourseFeedback } from "./CourseFeedback.js";
import { api } from './api.js';
import { mergeItems } from "./helper.js";

const STORAGE_KEY_COURSES = "cp_courses_videos";

/* =========================
   INTERNAL STATE
========================= */

export const courseVideos = loadCourseVideos() || [
  {
    id: "2",
    videos: [
      {
        videoURL: "",
        videoTitle: ""
      }
    ]
  }
];

/* =========================
   STORAGE HELPERS
========================= */

function loadCourseVideos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_COURSES)) || []; } catch (e) { return []; }
}

function saveCourseVideos() {
  try {
    localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courseVideos));
    // Optional backend sync
    api.post('/courseVideos/sync', JSON.stringify(courseVideos)).catch(console.error);
  } catch (e) {}
}


/* =========================
   API FETCH & MERGE
========================= */

export async function fetchAndMergeCourseVideos(url) {
  try {
    const newVideos = await api.get(url);
    if (!Array.isArray(newVideos)) throw new Error("Invalid course videos payload");

    const merged = mergeItems(courseVideos, newVideos, 'id');
    courseVideos.length = 0;
    courseVideos.push(...merged);

    saveCourseVideos();
  } catch (e) {
    console.error("Failed to fetch course videos:", e);
  }
}

fetchAndMergeCourseVideos('/courseVideos/')

/* =========================
   VIDEO MANAGEMENT
========================= */

export function createVideo(id, url, title) {
  const videoFind = courseVideos.find(course => course.id === id);

  const newVideo = { videoTitle: title, videoURL: url };

  if (videoFind) {
    // Add only if video URL+title not exists
    if (!videoFind.videos.some(v => v.videoURL === url && v.videoTitle === title)) {
      videoFind.videos.push(newVideo);
    }
  } else {
    courseVideos.push({ id, videos: [newVideo] });
  }

  saveCourseVideos();
}

/* =========================
   GETTERS
========================= */

export const CourseInformation = {
  getVideos(id) {
    const course = courseVideos.find(course => course.id === id);
    return course ? course.videos : [];
  },

  getIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  },

  getCourseVideoById(id) {
    return courseVideos.find(course => course.id === id) || null;
  },

  courseInfo() {
    const id = Number(this.getIdFromURL());
    const course = getCourse(id);
    if (!course) return null;
    course.feedback = CourseFeedback.getFeedback(id.toString());
    return course;
  }
};
