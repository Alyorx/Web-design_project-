// Complete Progress System:
// trackProgress, XP, streaks, certificates, exercises, notifications (PERSISTENT)

import { courseList } from './courseSystem.js';
import { mergeXP } from './helper.js';
import { api } from './api.js';

// STORAGE KEYS 
const STORAGE_KEY_PROGRESS = "cp_progress_v2";
const STORAGE_KEY_CERTIFICATES = "cp_certificates_v2";
const STORAGE_KEY_STREAKS = "cp_streaks_v2";
const STORAGE_KEY_XP = "cp_xp_v2";
const STORAGE_KEY_EXERCISES = "cp_exercises_v2";
const STORAGE_KEY_NOTIFICATIONS = "cp_notifications_v1"; // Key for storing notifications

// IN MEMORY DATA 
let progressList = loadProgress() || [];
let certificates = loadCertificates() || [];
let streaks = loadStreaks() || [];
let xpList = loadXP() || [];
let exercisesList = loadExercises() || [];
let notificationList = loadNotifications() || []; // in memory list for notifications

//  Load & Save Helpers
/**
 * Load progress from localStorage
 * @returns {Array<{userId: number|string, courseId: number|string, progress: number, updatedAt: string}>}
 */
function loadProgress() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_PROGRESS)) || []; } catch (e) { return []; } }
/**
 * Save progress to localStorage
 */
function saveProgress() { localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progressList)); }

/**
 * Load certificates from localStorage
 * @returns {Array<{userId: number|string, courseId: number|string, issuedAt: string, certificateId: string}>}
 */
function loadCertificates() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_CERTIFICATES)) || []; } catch (e) { return []; } }
/**
 * Save certificates to localStorage
 */
function saveCertificates() { localStorage.setItem(STORAGE_KEY_CERTIFICATES, JSON.stringify(certificates)); }

/**
 * Load streaks from localStorage
 * @returns {Array<{userId: number|string, count: number, lastDate: string}>}
 */
function loadStreaks() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_STREAKS)) || []; } catch (e) { return []; } }
/**
 * Save streaks to localStorage
 */
function saveStreaks() { localStorage.setItem(STORAGE_KEY_STREAKS, JSON.stringify(streaks)); }

/**
 * Load XP from localStorage
 * @returns {Array<{userId: number|string, points: number}>}
 */
function loadXP() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_XP)) || []; } catch (e) { return []; } }
/**
 * Save XP to localStorage
 */
function saveXP() { localStorage.setItem(STORAGE_KEY_XP, JSON.stringify(xpList)); }


async function fetchAllXP() {
  // GET ALL XP FROM SERVER
  return api.get("/xps/");
}

async function syncAllXP(xpList) {
  // POST ALL XP TO SERVER
  return api.post("/xps/sync", xpList);
}

/**
 * Load exercises from localStorage
 * @returns {Array<{id: number, courseId: number|string, topic: string, [key: string]: any}>}
 */
function loadExercises() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_EXERCISES)) || []; } catch (e) { return []; } }
/**
 * Save exercises to localStorage
 */
function saveExercises() { localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(exercisesList)); }

/**
 * Load notifications from localStorage
 * @returns {Array<AppNotification>}
 */
function loadNotifications() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_NOTIFICATIONS)) || []; } catch (e) { return []; } }
/**
 * Save notifications to localStorage
 */
function saveNotifications() { localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notificationList)); }

// Notification
/**
 * Show a temporary notification and save it persistently
 * @param {string} message - The message to show
 * @param {"success"|"error"|"info"} [type="info"] - Type of notification
 */
function showNotification(message, type = "info") {
  const newNotification = {
    id: Date.now(),
    message,
    type,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  notificationList.push(newNotification);
  saveNotifications();

  const CONTAINER_ID = "cp-notification-stack";
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    container.style = `
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 9999;
    `;
    document.body.appendChild(container);
  }

  const box = document.createElement("div");
  box.textContent = message;
  box.style = `
    background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : "#2196F3"};
    color: #fff; padding: 12px 18px; border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2); font-family: Poppins, sans-serif;
    opacity: 0; transform: translateX(100%);
    transition: all 0.4s ease;
  `;
  container.appendChild(box);

  setTimeout(() => { box.style.opacity = "1"; box.style.transform = "translateX(0)"; }, 50);
  setTimeout(() => {
    box.style.opacity = "0"; box.style.transform = "translateX(100%)";
    setTimeout(() => box.remove(), 400);
  }, 3000);
}

// XP Functions
/**
 * Update user's XP
 * @param {number|string} userId - User ID
 * @param {number} amount - XP amount to add
 * @returns {number|null} Updated XP or null if invalid
 */

export function updateXP(userId, amount) {
  if (typeof amount !== "number" || isNaN(amount) || amount < 0) return null;

  const xpList = loadXP();
  let userXP = xpList.find(x => x.userId === userId);

  if (userXP) {
    userXP.points += amount;
  } else {
    userXP = { userId, points: amount };
    xpList.push(userXP);
  }

  saveXP(xpList);
  window.location.reload();
  showNotification(
    `🎉 You earned ${amount} XP (Total: ${userXP.points})`,
    "success"
  );

  return userXP.points;
}

/**
 * Get user's current XP
 * @param {number|string} userId
 * @returns {number}
 */
export function getUserXP(userId) {
  const xpList = loadXP();
  const userXP = xpList.find(x => x.userId === String(userId));
  print(userXP)
  return userXP ? userXP.points : 0;
}

// Track Progress
/**
 * Track user progress in a course
 * @param {number|string} userId
 * @param {number|string} courseId
 * @param {number} progress - 0 to 100
 * @returns {{userId: number|string, courseId: number|string, progress: number, updatedAt: string}|null}
 */
export function trackProgress(userId, courseId, progress) {
  if (userId == null || courseId == null) return null;
  if (progress < 0 || progress > 100) return null;

  const now = new Date().toISOString();
  let rec = progressList.find(p => p.userId === userId && p.courseId === courseId);
  const oldProgress = rec ? rec.progress : 0;

  if (rec) { rec.progress = progress; rec.updatedAt = now; }
  else { rec = { userId, courseId, progress, updatedAt: now }; progressList.push(rec); }

  saveProgress();
  updateStreak(userId);

  const xpEarned = progress - oldProgress;
  if (xpEarned > 0) updateXP(userId, xpEarned);

  return rec;
}

/**
 * Get progress for a user in a course
 * @param {number|string} userId
 * @param {number|string} courseId
 * @returns {{userId: number|string, courseId: number|string, progress: number, updatedAt: string}|null}
 */
export function getProgress(userId, courseId) { return progressList.find(p => p.userId === userId && p.courseId === courseId) || null; }

/**
 * Generate certificate for a user
 * @param {number|string} userId
 * @param {number|string} courseId
 * @returns {{userId: number|string, courseId: number|string, issuedAt: string, certificateId: string}|null}
 */
export function generateCertificate(userId, courseId) {
  const rec = getProgress(userId, courseId);
  if (!rec || rec.progress < 100) return null;
  const issuedAt = new Date().toISOString();
  const cert = { userId, courseId, issuedAt, certificateId: `CERT-${userId}-${courseId}-${Date.now()}` };
  certificates.push(cert);
  saveCertificates();
  updateXP(userId, 100);
  showNotification("🎓 Certificate generated!", "success");
  return cert;
}

/**
 * Update streak for a user
 * @param {number|string} userId
 * @returns {{userId: number|string, count: number, lastDate: string}}
 */
export function updateStreak(userId) {
  let s = streaks.find(st => st.userId === userId);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (!s) { s = { userId, count: 1, lastDate: today }; streaks.push(s); }
  else if (s.lastDate === today) { }
  else if (s.lastDate === yesterday) { s.count++; s.lastDate = today; }
  else { s.count = 1; s.lastDate = today; }
  saveStreaks();
  return s;
}

// Exercises
/**
 * Add an exercise to a course
 * @param {number|string} courseId
 * @param {string} topic
 * @param {Object} exerciseData
 * @returns {Object|null}
 */
export function addExercise(courseId, topic, exerciseData) {
  const courseExists = courseList.some(c => c.id === courseId);
  if (!courseExists) { showNotification("❌ Course ID not found. Exercise not added.", "error"); return null; }
  const id = exercisesList.length ? Math.max(...exercisesList.map(e => e.id)) + 1 : 1;
  const ex = { id, courseId, topic, ...exerciseData, createdAt: new Date().toISOString() };
  exercisesList.push(ex);
  saveExercises();
  showNotification("✅ Exercise added successfully.", "success");
  return ex;
}

/**
 * List exercises for a course and optional topic
 * @param {number|string} courseId
 * @param {string|null} [topic=null]
 * @returns {Array<Object>}
 */
export function listExercises(courseId, topic = null) {
  const courseExists = courseList.some(c => c.id === courseId);
  if (!courseExists) { showNotification("❌ Course ID not found. Cannot list exercises.", "error"); return []; }
  return exercisesList.filter(e => e.courseId === courseId && (topic ? e.topic === topic : true));
}

/**
 * Get all progress of a user
 * @param {number|string} userId
 * @returns {Array<Object>}
 */
export function getUserProgress(userId) { return progressList.filter(p => p.userId === userId); }
/**
 * List all progress records
 * @returns {Array<Object>}
 */
export function listAllProgress() { return progressList; }

/**
 * Cleanup all data related to a course
 * @param {number|string} courseId
 * @returns {boolean} True if any data removed
 */
export function cleanupCourseData(courseId) {
  let updated = false;
  const initialProgressLength = progressList.length;
  progressList = progressList.filter(p => p.courseId !== courseId);
  if (progressList.length < initialProgressLength) { saveProgress(); updated = true; }

  const initialCertificatesLength = certificates.length;
  certificates = certificates.filter(c => c.courseId !== courseId);
  if (certificates.length < initialCertificatesLength) { saveCertificates(); updated = true; }

  return updated;
}

// Notifications
/**
 * @typedef {Object} AppNotification
 * @property {number} id
 * @property {string} message
 * @property {"success"|"error"|"info"} type
 * @property {string} timestamp
 * @property {boolean} isRead
 */

/**
 * Get all notifications (newest first)
 * @returns {AppNotification[]}
 */
export function getNotifications() { return [...notificationList].sort((a, b) => b.id - a.id); }
/**
 * Get count of unread notifications
 * @returns {number}
 */
export function getUnreadCount() { return notificationList.filter(n => !n.isRead).length; }

/**
 * Mark notification(s) as read
 * @param {number|null} [notificationId=null] - Specific notification ID or null for all
 */
export function markAsRead(notificationId = null) {
  let updated = false;
  if (notificationId) {
    const n = notificationList.find(n => n.id === notificationId);
    if (n && !n.isRead) { n.isRead = true; updated = true; }
  } else {
    notificationList.forEach(n => { if (!n.isRead) { n.isRead = true; updated = true; } });
  }
  if (updated) saveNotifications();
}



export async function syncXPSystem() {
  const localXP = loadXP();

  try {
    const serverXP = await fetchAllXP();

    const mergedXP = mergeXP(localXP, serverXP);

    // Save merged locally
    saveXP(mergedXP);

    // Push merged to server
    await syncAllXP(mergedXP);

    return mergedXP;
  } catch (err) {
    console.error("XP sync failed:", err);
    return localXP; // fallback
  }
}

syncXPSystem()