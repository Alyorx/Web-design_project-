import { getCourse, courseList } from "./courseSystem.js";
import { updateXP } from "./progressSystem.js";
import { api } from "./api.js";
import { mergeFeedbackData } from "./helper.js";

/* =========================
   TYPES
========================= */

/**
 * @typedef {Object} CourseFeedback
 * @property {string} userId
 * @property {string=} comment
 * @property {number} stars
 */

/**
 * @typedef {Object} CourseFeedbackEntry
 * @property {string} courseId
 * @property {CourseFeedback[]} feedbacks
 */

/* =========================
   STORAGE
========================= */

const STORAGE_KEY_FEEDBACK = "courseFeedbackData";

/* =========================
   STORAGE HELPERS
========================= */

function initializeFeedbackData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_FEEDBACK)) || [];
  } catch {
    return [];
  }
}

function saveFeedbackData(data) {
  localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(data));
}


/**
 * Pull backend data ONCE and merge
 */
export async function syncFeedbackFromAPI() {
  try {
    const backendData = await api.get("/feedbacks");
    if (!Array.isArray(backendData)) return;

    const localData = initializeFeedbackData();
    const merged = mergeFeedbackData(localData, backendData);

    saveFeedbackData(merged);
  } catch (e) {
    console.error("Feedback sync failed:", e);
  }
}
syncFeedbackFromAPI()

/**
 * Push local data to backend (fire-and-forget)
 */
function syncFeedbackToAPI(data) {
  try {
    api.post("/feedbacks/sync", data);
  } catch {
    /* ignore */
  }
}

/* =========================
   MAIN API (LOGIC UNCHANGED)
========================= */

export const CourseFeedback = {

  addFeedback(courseId, userId, comment, stars) {
    const course = getCourse(Number(courseId));
    if (!course) return false;

    if (stars < 0 || stars > 5) return false;

    const feedbackData = initializeFeedbackData();
    let feedbackEntry = feedbackData.find(
      f => String(f.courseId) === String(courseId)
    );

    if (!feedbackEntry) {
      feedbackEntry = { courseId: String(courseId), feedbacks: [] };
      feedbackData.push(feedbackEntry);
    }

    const existingFeedback = feedbackEntry.feedbacks.find(
      f => f.userId === userId
    );
    if (existingFeedback) return false;

    feedbackEntry.feedbacks.push({
      userId,
      ...(comment ? { comment: comment.trim() } : {}),
      stars: Number(stars.toFixed(1))
    });

    saveFeedbackData(feedbackData);
    syncFeedbackToAPI(feedbackData);

    updateXP(userId, 10);
    return true;
  },

  getFeedback(courseId) {
    const feedbackData = initializeFeedbackData();
    const feedbackEntry = feedbackData.find(
      f => String(f.courseId) === String(courseId)
    );
    return feedbackEntry?.feedbacks || [];
  },

  getAverageRating(courseId) {
    const feedbacks = this.getFeedback(courseId)
      .filter(f => f.stars > 0 && f.stars <= 5);

    if (!feedbacks.length) return 0;

    const totalStars = feedbacks.reduce((sum, f) => sum + f.stars, 0);
    return Number((totalStars / feedbacks.length).toFixed(1));
  },

  getFeedbackCount(courseId) {
    return this.getFeedback(courseId).length;
  },

  updateFeedback(courseId, userId, comment, stars) {
    if (stars < 0 || stars > 5) return false;

    const feedbackData = initializeFeedbackData();
    const feedbackEntry = feedbackData.find(
      f => String(f.courseId) === String(courseId)
    );

    if (!feedbackEntry) return false;

    const idx = feedbackEntry.feedbacks.findIndex(
      f => f.userId === userId
    );
    if (idx === -1) return false;

    feedbackEntry.feedbacks[idx] = {
      userId,
      ...(comment ? { comment: comment.trim() } : {}),
      stars: Number(stars.toFixed(1))
    };

    saveFeedbackData(feedbackData);
    syncFeedbackToAPI(feedbackData);
    return true;
  },

  deleteFeedback(courseId, userId) {
    const feedbackData = initializeFeedbackData();
    const entryIdx = feedbackData.findIndex(
      f => String(f.courseId) === String(courseId)
    );
    if (entryIdx === -1) return false;

    const fbIdx = feedbackData[entryIdx].feedbacks.findIndex(
      f => f.userId === userId
    );
    if (fbIdx === -1) return false;

    feedbackData[entryIdx].feedbacks.splice(fbIdx, 1);

    if (feedbackData[entryIdx].feedbacks.length === 0) {
      feedbackData.splice(entryIdx, 1);
    }

    saveFeedbackData(feedbackData);
    syncFeedbackToAPI(feedbackData);
    return true;
  },

  syncWithCourseSystem() {
    const feedbackData = initializeFeedbackData();
    const courseIds = courseList.map(c => String(c.id));

    const cleaned = feedbackData.filter(f =>
      courseIds.includes(String(f.courseId))
    );

    courseIds.forEach(id => {
      if (!cleaned.some(f => String(f.courseId) === id)) {
        cleaned.push({ courseId: id, feedbacks: [] });
      }
    });

    saveFeedbackData(cleaned);
    syncFeedbackToAPI(cleaned);
  }
};