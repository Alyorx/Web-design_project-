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
   * @param {string} courseId
   * @param {string} userId
   * @param {string} comment
   * @param {number} stars
   * @returns {boolean}
   */
  addFeedback(courseId, userId, comment, stars) {
    // Verify course exists in course system
    const course = getCourse(Number(courseId));
    if (!course) {
      return false;
    }

    const feedbackData = initializeFeedbackData();
    let feedbackEntry = feedbackData.find(f => f.courseId === courseId);

    if (!feedbackEntry) {
      console.log("test1.5")
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
      console.log("test2")
      return false;
    }

    // Validate stars rating
    if (stars < 0 || stars > 5) {
      console.log("test3")
      return false;
    }

    
    // Add new feedback
    if (comment === null){
      feedbackEntry.feedbacks.push({ 
        userId, 
        stars: Number(stars.toFixed(1)) 
      });
    }else{
      feedbackEntry.feedbacks.push({ 
        userId, 
        comment: comment.trim(), 
        stars: Number(stars.toFixed(1)) 
      });
    }
    saveFeedbackData(feedbackData);
    
    return true;
  },

  /**
   * Get all feedback for course - linked with course system
   * @param {string} courseId
   * @returns {Object[]}
   */
  getFeedback(courseId) {
    const feedbackData = initializeFeedbackData();
    const feedbackEntry = feedbackData.find(f => f.courseId == courseId);
    return feedbackEntry?.feedbacks || [];
  },

  /**
   * Calculate average rating for course
   * @param {string} courseId
   * @returns {number}
   */

  // Change the totalstars (map it into a new arr + get the average rating of all valid)
  getAverageRating(courseId) {
    const feedbacks = this.getFeedback(courseId);
    const validFeedbacks = feedbacks.filter(f => f.stars > 0 && f.stars <= 5);
  
    if (validFeedbacks.length === 0) return 0;

    const totalStars = validFeedbacks.reduce((sum, f) => sum + f.stars, 0);
    return Number((totalStars / validFeedbacks.length).toFixed(1));
  },

  /**
   * Get feedback count for a course
   * @param {string} courseId
   * @returns {number}
   */
  getFeedbackCount(courseId) {
    return this.getFeedback(courseId).length;
  },

  /**
   * Update existing feedback, probably important
   * @param {string} courseId
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

    if(comment === null){
      feedbackEntry.feedbacks[feedbackIndex] = { 
        userId, 
        stars: Number(stars.toFixed(1)) 
      }
    }
    else{
      feedbackEntry.feedbacks[feedbackIndex] = { 
        userId, 
        comment: comment.trim(), 
        stars: Number(stars.toFixed(1)) 
      };
    }
    saveFeedbackData(feedbackData);
    return true;
  },

  /**
   * Delete feedback
   * @param {string} courseId
   * @param {string} userId
   * @returns {boolean}
   */
  deleteFeedback(courseId, userId) {
    const feedbackData = initializeFeedbackData();
    const feedbackEntry = feedbackData.find(f => f.courseId === Number(courseId));
    
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
      const entryIndex = feedbackData.find(f => f.courseId === courseId);
      feedbackData.splice(entryIndex, 1);
    }
    
    saveFeedbackData(feedbackData);
    
    return true;
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