import { getCurrentUser } from "./userSystem.js";

export const ExploreSystem = {
  // Wishlist: userID → [array of courseIDs]
  wishlist: {},

  /**
   * Adds a course to the user's wishlist.
   * @param {string} userID 
   * @param {string} courseID 
   * @returns {boolean}
   */
  addToWishlist(userID, courseID) {
    if (!this.wishlist[userID]) this.wishlist[userID] = [];
    if (this.wishlist[userID].includes(courseID)) return false;

    this.wishlist[userID].push(courseID);
    return true;
  },

  /**
   * Removes a course from the user's wishlist.
   * @param {string} userID 
   * @param {string} courseID 
   * @returns {boolean}
   */
  removeFromWishlist(userID, courseID) {
    if (!this.wishlist[userID]) return false;

    const index = this.wishlist[userID].indexOf(courseID);
    if (index === -1) return false;

    this.wishlist[userID].splice(index, 1);
    return true;
  },

  /**
   * Returns courses sorted by visits (descending).
   * @param {Course[]} courses
   * @returns {Course[]}
   */
  getTrending(courses) {
    return [...courses].sort((a, b) => b.visits - a.visits);
  },

  /**
   * Filters courses based on criteria.
   * @param {Course[]} courses
   * @param {object} criteria 
   * @returns {Course[]}
   */
  filterCourses(courses, criteria) {
    return courses.filter(course => {
      return Object.entries(criteria).every(([key, value]) => {
        if (key === "minRating") return course.rating >= value;
        if (key === "minPrice") return course.price > value;
        if (key === "maxPrice") return course.price <= value;
        if (key === "minDuration") return course.duration > value;
        if (key === "maxDuration") return course.duration <= value;
        if (key === "enrolled") {
          const userType = getCurrentUser.role !== `student`;
          switch(value){
            case 'owned': return getCurrentUser().enrolledCourses.includes(course.id);
            case 'unowned': return !(getCurrentUser().enrolledCourses.includes(course.id));
            default: true;
          }
        }
        return course[key] === value;
      });
    });
  },

  /**
   * Searches courses by keyword in title, description, or tags.
   * @param {Course[]} courses
   * @param {string} keyword 
   * @returns {Course[]}
   */
  searchCourses(courses, keyword) {
    const lower = keyword.toLowerCase();
    return courses.filter(c =>
      c.title.toLowerCase().includes(lower) ||
      c.description.toLowerCase().includes(lower)
    );
  },

  /**
   * Searches instructors by keyword in name.
   * @param {Instructors[]} instructors
   * @param {string} keyword 
   * @returns {Course[]}
   */
  searchInstructor(instructors, keyword) {
    const lower = keyword.toLowerCase();
    return instructors.filter(c =>
      c.name.toLowerCase().includes(lower) && c.role === "admin"
    );
  },

  /**
   * Searches Students by keyword in name.
   * @param {Instructors[]} instructors
   * @param {string} keyword 
   * @returns {Course[]}
   */
  searchStudents(students, keyword) {
    const lower = keyword.toLowerCase();
    return students.filter(c =>
      c.name.toLowerCase().includes(lower) && c.role === "student"
    );
  },

  /**
   * Returns paginated courses.
   * @param {Course[]} courseList 
   * @param {number} page 
   * @param {number} limit 
   * @returns {{data: Course[], totalPages: number, currentPage: number}}
   */
  pagination(courseList, page, limit) {
    const total = courseList.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: courseList.slice(start, end),
      totalPages,
      currentPage: page
    };
  }
};
