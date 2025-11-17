import { courseList, createCourse } from "../../assets/js/Modules/courseSystem.js"
import { deleteCourse } from "../../assets/js/Modules/courseSystem.js"
import { courseList as Courses } from "../../assets/js/Modules/courseSystem.js"
import { editCourse } from "../../assets/js/Modules/courseSystem.js"
import { listUsers } from "../../assets/js/Modules/userSystem.js"
import { CourseFeedback } from "../../assets/js/Modules/CourseFeedback.js"
import { register } from "../../assets/js/Modules/userSystem.js"
import { getCurrentUser } from "../../assets/js/Modules/userSystem.js"
import { logout } from "../../assets/js/Modules/userSystem.js"


if(getCurrentUser() != null){
  if(getCurrentUser().role != `admin`){
    window.location.href=`../errorpage.html`
  }
}else{
  window.location.href=`../errorpage.html`
}


// Mock data and simple UI logic for the admin mockup
const state = {
  students: 0,
  courses : Courses,
  instructors : [],
  users: listUsers(),
  activities: [],
  payments: [],
  reviews: []
}


let admins = (state.users.filter((v) => v.role == `admin`))

state.instructors = (state.users.filter((v) => v.role == `admin`))

state.students = (state.users.length) - (admins.length)



// DOM helpers
const $ = selector => document.querySelector(selector)
const $$ = selector => Array.from(document.querySelectorAll(selector))



$(`.profile`).innerHTML = `${getCurrentUser().name}`




synchronization_render()

function renderAdminPage(){
  $('#totalStudents').textContent = state.students
  $('#totalCourses').textContent = state.courses.length
  $('#totalInstructors').textContent = state.instructors.length
  $('#revenue').textContent = (state.courses.reduce((s,c)=> s + (c.enrolled*9.99),0)).toFixed(2) + ` ` +'LE'

  // render recent courses
  const tbody = $('#coursesTable tbody')
  tbody.innerHTML = ''
  state.courses.forEach(c => {
    const tr = document.createElement('tr')
    
    tr.innerHTML = `
      <td>${c.title}</td>
      <td>${c.instructor}</td>
      <td class="status status-${c.status.toLowerCase()}">${c.status}</td>
      <td>
        ${c.status !== 'Published' ? `<button class="approve-btn btn" data-id="${c.id}">Approve</button>` : ''}
        <button class="view-btn btn" data-id="${c.id}">View</button>
      </td>
    `
    tbody.appendChild(tr)
  })

  // render courses in courses tab
  const coursesbody = $('#allCoursesTable tbody')
  coursesbody.innerHTML = ''
  state.courses.forEach(c => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.title}</td>
      <td>${c.category}</td>
      <td>${c.price}$</td>
      <td>${c.enrolled}</td>
      <td>${CourseFeedback.getAverageRating(c.id)}</td>
      <td class="status status-${c.status.toLowerCase()}">${c.status}</td>
      <td><button class="remove-course-btn btn danger" data-id="${c.id}">Remove</button></td>
    `
    coursesbody.appendChild(tr)
  })

  // render instructors in instructors tab
  const instructorsbody = $('#instructorsTable tbody')
  instructorsbody.innerHTML = ''
  state.instructors.forEach(instructor => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong>${instructor.id}</strong>
      </td>
      <td>
        <strong>${instructor.name}</strong>
        <br><small>${instructor.email}</small>
      </td>
      <td>
        ${instructor.courses.map(course => 
          `<div class="course-chip" data-course-id="${course.id}">
            ${course.title}
          </div>`
        ).join('')}
        ${instructor.courses.length === 0 ? '<div>No courses</div>' : ''}
      </td>
      <td>$${instructor.earnings}</td>
      <td>
        <button class="btn view-instructor" data-id="${instructor.id}">View</button>
        <button class="btn contact-instructor" data-email="${instructor.email}">Contact</button>
      </td>
    `;
    instructorsbody.appendChild(tr);
  })

  // render students in students tab
  const studentsBody = $('#studentsTable tbody')
  studentsBody.innerHTML = ''
  state.users.filter((v) => v.role == `student`).forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.password}</td>
    `
    studentsBody.appendChild(tr);
  })


  // render reviews on reviews tab
  const reviewsList = $('#reviewsList');
  reviewsList.innerHTML = '';

  state.courses.forEach(c => {
    const feedbacks = CourseFeedback.getFeedback(c.id);
    const courseTitle = document.createElement('li');
    courseTitle.innerHTML = `<strong>${c.title}</strong>`;
    reviewsList.appendChild(courseTitle);
    
    // Create reviews list for this course
    if (feedbacks.length > 0) {
      const reviewsUl = document.createElement('ul');
      feedbacks.forEach(f => {
        const reviewLi = document.createElement('li');
        reviewLi.innerHTML = `<strong>${f.userId}</strong>: "${f.comment}", ${f.stars}/5 stars
        <span><button class="remove-review-btn btn danger" data-id="${c.id}" data-userid="${f.userId}">Remove</button></span>`;
        reviewsUl.appendChild(reviewLi);
      });
      
      reviewsList.appendChild(reviewsUl);
    } else {
      const noReviewsLi = document.createElement('li');
      noReviewsLi.innerHTML = '<em>No reviews yet</em>';
      reviewsList.appendChild(noReviewsLi);
    }
  });


  // activity
  const act = $('#activityList')
  act.innerHTML = ''
  state.activities.forEach(a=>{const li = document.createElement('li'); li.textContent=a; act.appendChild(li)})
}




/* Burger Menu & Choices */

const burgerMenu = document.querySelector('.burger-menu');
const sidebar = document.querySelector('.sidebar');
const app = document.querySelector('.app');

burgerMenu.addEventListener('click', () => {
  burgerMenu.classList.toggle('active');
  sidebar.classList.toggle('active');
  
  app.classList.toggle('sidebar-open');
});




$$('.nav-item[data-section]').forEach(item => {

  item.addEventListener('click', function() {
    $$('.nav-item').forEach(nav => nav.classList.remove('active'))

    this.classList.add('active')
    
    const section = this.getAttribute('data-section')

    $$('.page').forEach(section => section.classList.add('hidden'))

    $(`#${section}`).classList.remove('hidden')

        
  })
})


/* Courses */

function addNewCourse(title, instructorName, category,price, duration, description) {

  // Generate new ID (highest existing ID + 1)
  const newId = Math.max(...state.courses.map(c => c.id), 0) + 1;
  newId.toString();


  const newCourse = {
    id: newId,
    title: title,
    instructor: instructorName,
    category: category,
    price: price,
    enrolled: 0,
    status: 'Pending',
    duration: duration,
    description: description
  };

  createCourse(newCourse)

  updateInstructorCourses(instructorName, newId, title);

  synchronization_render()
}

// Event listener for new course button
$('#newCourseBtn').addEventListener('click', AddCourseModal);


// Modal Form that pops up

function AddCourseModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Add New Course</h2>
      <form id="addCourseForm">
        <div class="form-group">
          <label for="courseTitle">Course Title:</label>
          <input type="text" id="courseTitle" required>
        </div>
        
        <div class="form-group">
          <label for="courseInstructor">Instructor:</label>
          <select id="courseInstructor" required>
            <option value="">Select an instructor</option>
            ${admins.map(instructor => 
              `<option value="${instructor.name}">${instructor.name}</option>`
            ).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label for="courseCategory">Category:</label>
          <select id="courseCategory" required>
              <option value="">Select a category</option>
              <option value="Web Development">Web Development</option>
              <option value="Design">Design</option>
              <option value="AI">Artificial Intelligence</option>
              <option value="Cyber">CyberSecurity</option>
          </select>
        </div>

        <div class="form-group">
          <label for="coursePrice">Price (in USD):</label>
          <input type="number" id="coursePrice" placeholder="$$$" required>
        </div>

        <div class="form-group">
          <label for="courseDuration">Duration (in Weeks):</label>
          <input type="number" id="courseDuration" placeholder="Weeks" required>
        </div>

        <div class="form-group">
          <label for="courseDescription">Description:</label>
          <input type="text" id="courseDescription" required>
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel btn danger">Cancel</button>
          <button type="submit" class="btn primary">Add Course</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);

  // Can't $ since this is from the modal, not the document
  modal.querySelector('.cancel').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.querySelector('#addCourseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('courseTitle').value;
    const instructor = document.getElementById('courseInstructor').value;

    const category = document.getElementById('courseCategory').value;

    const price = document.getElementById('coursePrice').value;
    const duration = document.getElementById('courseDuration').value;

    const description = document.getElementById('courseDescription').value;
    
    if (title && instructor && category && price && duration && description) {
      addNewCourse(title, instructor, category, price,duration, description);
      document.body.removeChild(modal);
    }
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

}


// Remove Function (Courses)
function removeSpecificCourse(courseId) {
  
  if (confirm('Are you sure you want to remove this course?')) {
   
    deleteCourse(courseId);
    
    synchronization_render()
  }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-course-btn')) {
    
    const courseId = parseInt(e.target.getAttribute('data-id'));
    
    removeSpecificCourse(courseId);
  }
});

// Remove Function (Reviews)
function removeSpecificReview(courseId, userID) {
  if (confirm('Are you sure you want to remove this review?')) {
   
    CourseFeedback.deleteFeedback(courseId, userID)
    
    synchronization_render()
  }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-review-btn')) {
    
    const courseId = (e.target.getAttribute('data-id'));
    const userId = (e.target.getAttribute('data-userid'));
    removeSpecificReview(+courseId, userId);
  }
});


/* Instructors */

// Get courses by instructor name
function getCoursesByInstructor(instructorName) {
  return state.courses.filter(course => course.instructor === instructorName).map(course => ({ id: course.id, title: course.title }));
}

// Update instructor courses when adding a new course
function updateInstructorCourses(instructorName, courseId, courseTitle) {
  const instructor = state.instructors.find(inst => inst.name === instructorName);
  if (instructor) {
    // Check if course already exists in instructor's courses
    const courseExists = instructor.courses.some(course => course.id === courseId);
    if (!courseExists) {
      instructor.courses.push({ id: courseId, title: courseTitle });
    }
  }
}

// NEW: Sync all instructor courses with the actual course data
function syncAllInstructorCourses() {

  state.instructors.forEach(instructor => {
    const approvedCourses = state.courses.filter(course => course.instructor === instructor.name && course.status === "Approved"
    );
    
    // Update instructor's courses array with only approved courses
    instructor.courses = approvedCourses.map(course => ({
      id: course.id,
      title: course.title
    }));
    //  Update earnings based on course enrollments
    instructor.earnings = calculateInstructorEarnings(instructor.name);
  });
}

//Calculate earnings based on course enrollments
function calculateInstructorEarnings(instructorName) {
  const instructorCourses = state.courses.filter(course => course.instructor === instructorName);
  return instructorCourses.reduce((total, course) => {
    // Assuming 30% for instructor (adjust as needed in settings!!!)
    return total + (course.enrolled * 9.99 * 0.3);
  }, 0);
}



// Event Listenenr to Approvals

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('approve-btn')) {
    const courseId = parseInt(e.target.getAttribute('data-id'));
    const course = state.courses.find(c => c.id === courseId);
    
    if (course) {
      course.status = "Approved";
      editCourse(courseId, course)
      synchronization_render()
    }
  }
});


function addNewInstructor(name, email) {
  // Generate new ID (highest existing ID + 1)
  const newId = Math.max(...state.instructors.map(c => c.id), 0) + 1;

  const emailExists = state.instructors.some(instructor => 
    instructor.email.toLowerCase() === email.toLowerCase()
  );
  
  if (emailExists) {
    alert('An instructor with this email already exists, Please try another Email.');
    return;
  }

  state.instructors.push({
    id: newId,
    name: name,
    email: email,
    courses : [],
    earnings : 0,
  });

  let instructorData = {
    name: name,
    email: email,
    password: "1234",
    role: "admin",
  }

  register(instructorData)
  // Re-render the UI if needed
  synchronization_render()
}

// Event listener for new instructor button
$('#newInstructorBtn').addEventListener('click', AddInstructorModal);


// Modal Form that pops up

function AddInstructorModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Add Instructor Course</h2>
      <form id="addInstructorForm">
        <div class="form-group">
          <label for="instructorName">Instructor Name:</label>
          <input type="text" id="instructorName" required>
        </div>
        
        <div class="form-group">
          <label for="instructorEmail">Email:</label>
          <input type="email" id="instructorEmail" required>
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel btn danger">Cancel</button>
          <button type="submit" class="btn primary">Add Instructor</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);

  // Can't $ since this is from the modal, not the document
  modal.querySelector('.cancel').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.querySelector('#addInstructorForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('instructorName').value;
    const email = document.getElementById('instructorEmail').value;
    
    if (name && email) {
      addNewInstructor(name, email);
      document.body.removeChild(modal);
    }
  });
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

}


/* Settings Page */

// Logout

const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', () => {
    logout();
    alert(`Logout Successful.`);
    window.location.href = `../login.html`
});









/* Synchronizations */

function synchronization_render(){
  syncAllInstructorCourses()
  CourseFeedback.syncWithCourseSystem()
  renderAdminPage()
  admins = (state.users.filter((v) => v.role == `admin`))
}



renderAdminPage()
