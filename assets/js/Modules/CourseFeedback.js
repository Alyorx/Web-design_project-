import { getCourse, courseList } from "./courseSystem.js";

// Variables

/**
 * @typedef {Object} CourseFeedback
 * @property {string} userId
 * @property {string} comment
 * @property {number} stars
 */

/**
 * @typedef {Object} Course
 * @property {string} courseId
 * @property {CourseFeedback[]} feedbacks
 */

// localStorage key
const STORAGE_KEY_FEEDBACK = 'courseFeedbackData';

// Initialize or load feedback data from localStorage
const initializeFeedbackData = () => {
  const storedData = localStorage.getItem(STORAGE_KEY_FEEDBACK);
  if (storedData) {
    return JSON.parse(storedData);
  } else {
    const emptyData = [];
    localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(emptyData));
    return emptyData;
  }
};

// Save data to localStorage
const saveFeedbackData = (data) => {
  localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(data));
};

export const CourseFeedback = {
  /**
   * Add new feedback to course
   * @param {number} courseId
   * @param {string} userId
   * @param {string} comment
   * @param {number} stars
   * @returns {boolean}
   */
  addFeedback(courseId, userId, comment, stars) {
    // Verify course exists in course system
    const course = getCourse(courseId);
    if (!course) {
      return false;
    }

    const feedbackData = initializeFeedbackData();
    let feedbackEntry = feedbackData.find(f => f.courseId === courseId);

    if (!feedbackEntry) {
      // If course doesn't exist in feedback data, create it with your structure
      feedbackEntry = { 
        courseId: courseId,
        feedbacks: []
      };
      feedbackData.push(feedbackEntry);
    }

    // Check if user already submitted feedback so no duplicates
    const existingFeedback = feedbackEntry.feedbacks.find(f => f.userId === userId);
    if (existingFeedback) {
      return false;
    }

    // Validate stars rating
    if (stars < 0 || stars > 5) {
      return false;
    }

    // Add new feedback
    feedbackEntry.feedbacks.push({ 
      userId, 
      comment: comment.trim(), 
      stars: Number(stars.toFixed(1)) 
    });
    saveFeedbackData(feedbackData);
    
    return true;
  },

  /**
   * Get all feedback for course - linked with course system
   * @param {number} courseId
   * @returns {Object[]}
   */
  getFeedback(courseId) {
    const feedbackData = initializeFeedbackData();
    const feedbackEntry = feedbackData.find(f => f.courseId === courseId);
    return feedbackEntry?.feedbacks || [];
  },

  /**
   * Calculate average rating for course
   * @param {number} courseId
   * @returns {number}
   */
  getAverageRating(courseId) {
    const feedbacks = this.getFeedback(courseId);
    if (feedbacks.length === 0) return 0;

    const totalStars = feedbacks.reduce((sum, f) => sum + f.stars, 0);
    return Number((totalStars / feedbacks.length).toFixed(1));
  },

  /**
   * Get feedback count for a course
   * @param {number} courseId
   * @returns {number}
   */
  getFeedbackCount(courseId) {
    return this.getFeedback(courseId).length;
  },

  /**
   * Update existing feedback, probably important
   * @param {number} courseId
   * @param {string} userId
   * @param {string} comment
   * @param {number} stars
   * @returns {boolean}
   */
  updateFeedback(courseId, userId, comment, stars) {
    const feedbackData = initializeFeedbackData();
    const feedbackEntry = feedbackData.find(f => f.courseId === courseId);
    
    if (!feedbackEntry) {
      return false;
    }

    const feedbackIndex = feedbackEntry.feedbacks.findIndex(f => f.userId === userId);
    if (feedbackIndex === -1) {
      return false;
    }

    // Validate stars rating
    if (stars < 0 || stars > 5) {
      return false;
    }

    feedbackEntry.feedbacks[feedbackIndex] = { 
      userId, 
      comment: comment.trim(), 
      stars: Number(stars.toFixed(1)) 
    };
    saveFeedbackData(feedbackData);
    
    return true;
  },

  /**
   * Delete feedback
   * @param {number} courseId
   * @param {string} userId
   * @returns {boolean}
   */
  deleteFeedback(courseId, userId) {
    const feedbackData = initializeFeedbackData();
    const feedbackEntry = feedbackData.find(f => f.courseId === courseId);
    
    if (!feedbackEntry) {
      return false;
    }

    const feedbackIndex = feedbackEntry.feedbacks.findIndex(f => f.userId === userId);
    if (feedbackIndex === -1) {
      return false;
    }

    feedbackEntry.feedbacks.splice(feedbackIndex, 1);
    
    // Remove feedback entry if no feedbacks left
    if (feedbackEntry.feedbacks.length === 0) {
      const entryIndex = feedbackData.findIndex(f => f.courseId === courseId);
      feedbackData.splice(entryIndex, 1);
    }
    
    saveFeedbackData(feedbackData);
    
    return true;
  },

  /**
   * Clear all feedback data
   */
  clearAllData() {
    localStorage.removeItem(STORAGE_KEY_FEEDBACK);
  },
  
  /**
   * Auto-sync with course system (call when courses are added/deleted)
   */
  syncWithCourseSystem() {
    const feedbackData = initializeFeedbackData();
    const currentCourseIds = courseList.map(course => course.id);
    
    // Remove feedback for deleted courses
    const cleanedData = feedbackData.filter(entry => 
      currentCourseIds.includes(entry.courseId)
    );
    
    // Add entries for new courses
    courseList.forEach(course => {
      const existingEntry = cleanedData.find(entry => entry.courseId === course.id);
      if (!existingEntry) {
        // New course - add entry with your structure
        cleanedData.push({
          courseId: course.id,
          feedbacks: []
        });
      }
    });

    saveFeedbackData(cleanedData);
  }
};