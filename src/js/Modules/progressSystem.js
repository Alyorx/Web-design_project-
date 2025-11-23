// Complete Progress System:
//  trackProgress, XP, streaks, certificates, exercises, notifications (PERSISTENT)

import { courseList } from './courseSystem.js';

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
function loadProgress() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_PROGRESS)) || []; } catch (e) { return []; } }
function saveProgress() { localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progressList)); }

function loadCertificates() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_CERTIFICATES)) || []; } catch (e) { return []; } }
function saveCertificates() { localStorage.setItem(STORAGE_KEY_CERTIFICATES, JSON.stringify(certificates)); }

function loadStreaks() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_STREAKS)) || []; } catch (e) { return []; } }
function saveStreaks() { localStorage.setItem(STORAGE_KEY_STREAKS, JSON.stringify(streaks)); }

function loadXP() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_XP)) || []; } catch (e) { return []; } }
function saveXP() { localStorage.setItem(STORAGE_KEY_XP, JSON.stringify(xpList)); }

function loadExercises() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_EXERCISES)) || []; } catch (e) { return []; } }
function saveExercises() { localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(exercisesList)); }

// Notification Load/Save Helpers
function loadNotifications() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_NOTIFICATIONS)) || []; } catch (e) { return []; } }
function saveNotifications() { localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notificationList)); }


//  Notification
function showNotification(message, type = "info") {
  // 1. SAVE TO LIST: Create and save the persistent notification record
  const newNotification = {
    id: Date.now(), // Unique ID
    message: message,
    type: type,
    timestamp: new Date().toISOString(),
    isRead: false, // Starts as unread
  };

  notificationList.push(newNotification);
  saveNotifications(); // Save the updated list to localStorage

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

//  XP Functions
export function updateXP(userId, amount) {
  // 1. Check if amount is a number
  if (typeof amount !== "number" || isNaN(amount)) {
    return null;
  }

  // 2. Check if amount is negative
  if (amount < 0) {
    return null;
  }

  // 3. Find the user's XP record
  let userXP = xpList.find(x => x.userId === userId);

  // 4. Update or create XP record
  if (userXP) {
    userXP.points += amount;
  } else {
    userXP = { userId, points: amount };
    xpList.push(userXP);
  }

  // 5. Save changes
  saveXP();

  // 6. Show success message (This will now also save the notification record)
  showNotification(`🎉 You earned ${amount} XP Total: ${userXP.points}`, "success");

  return userXP.points;
}

export function getUserXP(userId) {
  const userXP = xpList.find(x => x.userId === userId);
  return userXP ? userXP.points : 0;
}

//  Track Progress
export function trackProgress(userId, courseId, progress) {
  if (userId == null || courseId == null) { console.log("userId and courseId required"); return null; }
  if (progress < 0 || progress > 100) { console.log("progress must be 0-100"); return null; }

  const now = new Date().toISOString();
  let rec = progressList.find(p => p.userId === userId && p.courseId === courseId);
  
  // Get old progress for XP calculation
  const oldProgress = rec ? rec.progress : 0;
  
  if (rec) { rec.progress = progress; rec.updatedAt = now; }
  else { rec = { userId, courseId, progress, updatedAt: now }; progressList.push(rec); }

  saveProgress();
  updateStreak(userId);

  // Auto XP for progress (optional: 1 XP per %)
  const xpEarned = progress - oldProgress;
  if (xpEarned > 0) updateXP(userId, xpEarned);

  return rec;
}

// Get progress for a user/course
export function getProgress(userId, courseId) { return progressList.find(p => p.userId === userId && p.courseId === courseId) || null; }

// Generate Certificate
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

// Streak tracking
export function updateStreak(userId) {
  let s = streaks.find(st => st.userId === userId);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (!s) { s = { userId, count: 1, lastDate: today }; streaks.push(s); }
  else if (s.lastDate === today) { } // already logged today
  else if (s.lastDate === yesterday) { s.count++; s.lastDate = today; }
  else { s.count = 1; s.lastDate = today; }
  saveStreaks();
  return s;
}

// Exercises with error handling
export function addExercise(courseId, topic, exerciseData) {
  // Validate courseId exists in the course system before proceeding
  const courseExists = courseList.some(c => c.id === courseId);
  if (!courseExists) {
    showNotification("❌ Course ID not found. Exercise not added.", "error");
    return null;
  }


  const id = exercisesList.length ? Math.max(...exercisesList.map(e => e.id)) + 1 : 1;
  const ex = { id, courseId, topic, ...exerciseData, createdAt: new Date().toISOString() };
  exercisesList.push(ex);
  saveExercises();
  showNotification("✅ Exercise added successfully.", "success");
  return ex;
}

export function listExercises(courseId, topic = null) {
  const courseExists = courseList.some(c => c.id === courseId);
  if (!courseExists) {
    showNotification("❌ Course ID not found. Cannot list exercises.", "error");
    return [];
  }
  return exercisesList.filter(e => e.courseId === courseId && (topic ? e.topic === topic : true));
}

// User Progress
export function getUserProgress(userId) { return progressList.filter(p => p.userId === userId); }
export function listAllProgress() { return progressList; }
/*
* @param {number} courseId - ID
@returns {boolean} 
 */
export function cleanupCourseData(courseId) {
    let updated = false;

    const initialProgressLength = progressList.length;
    progressList = progressList.filter(p => p.courseId !== courseId);
    if (progressList.length < initialProgressLength) {
        saveProgress();
        updated = true;
    }
 
    const initialCertificatesLength = certificates.length;
    certificates = certificates.filter(c => c.courseId !== courseId);
    if (certificates.length < initialCertificatesLength) {
        saveCertificates();
        updated = true;
    }
    
    return updated;
}
//  Notification Management Functions 
/**
 * @typedef {Object} AppNotification
 * @property {number} id - Unique timestamp ID
 * @property {string} message - Content of the notification
 * @property {string} type - 'success', 'error', or 'info'
 * @property {string} timestamp - ISO date string
 * @property {boolean} isRead - Read status
 */

/**
 * Retrieves the list of stored notifications (newest first)
 * @returns {AppNotification[]}
 */
export function getNotifications() {
  // Return a sorted copy of the list (newest first)
  return [...notificationList].sort((a, b) => b.id - a.id);
}

/**
 * Gets the count of unread notifications (the red number).
 * @returns {number}
 */
export function getUnreadCount() {
  return notificationList.filter(n => !n.isRead).length;
}

/**
 * Marks a specific notification or all notifications as read.
 * @param {number | null} notificationId  The ID of the notification to update, or null to update all
 */
export function markAsRead(notificationId = null) {
  let updated = false;

  if (notificationId) {
    const notification = notificationList.find(n => n.id === notificationId);
    if (notification && !notification.isRead) {
      notification.isRead = true;
      updated = true;
    }
  } else {+

    // Mark all as read
    notificationList.forEach(n => {
      if (!n.isRead) {
        n.isRead = true;
        updated = true;
      }
    });
  }

  if (updated) {
    saveNotifications();
  }
}
