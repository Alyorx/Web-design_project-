import { courseList, createCourse } from "./Modules/courseSystem.js"
import { deleteCourse } from "./Modules/courseSystem.js"
import { courseList as Courses } from "./Modules/courseSystem.js"
import { editCourse } from "./Modules/courseSystem.js"
import { getUser, listUsers, updateUser } from "./Modules/userSystem.js"
import { CourseFeedback } from "./Modules/CourseFeedback.js"
import { register } from "./Modules/userSystem.js"
import { getCurrentUser } from "./Modules/userSystem.js"
import { logout } from "./Modules/userSystem.js"
import { ExploreSystem } from"./Modules/ExploreSystem.js"
import { getCourse, courseDeletion } from "./Modules/courseSystem.js"
import { CourseInformation, courseVideos, createVideo } from "./Modules/CourseInformation.js"


if(getCurrentUser() != null){
  if(getCurrentUser().role != `admin`){
    window.location.href=`errorpage.html`
  }
}else{
  window.location.href=`errorpage.html`
}

// Shortcut to homepage. 
if (getCurrentUser()?.role === "admin") {
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "a") {
      window.location.href = "../index.html";
    }
});
}


// Debouncer

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
const debouncedRender = debounce(synchronization_render, 1500);
debouncedRender();



// Local Storage Stuff

const CommissionStorage = {
  key: "commission",

  load() {
    const value = localStorage.getItem(this.key);
    return value ? parseFloat(value) : 0;
  },

  save(amount) {
    if (typeof amount !== "number") {
      throw new Error("Commission must be a number");
    }
    if (amount < 0){
      throw new Error("Commission can't be in negative");
    }
    localStorage.setItem(this.key, amount.toString());
  },
};

const RecentActivities = {
  key: "recentActivities",
  maxSize: 5,

  load() {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  },

  save(stack) {
    localStorage.setItem(this.key, JSON.stringify(stack));
  },

  push(activity) {
    if (!activity) return;

    const stack = this.load();

    stack.unshift({
      activity,
      timestamp: new Date().toISOString(),
    });

    if (stack.length > this.maxSize) {
      stack.pop();
    }

    this.save(stack);
  },

  clear() {
    localStorage.removeItem(this.key);
  },
};


// Mock data and simple UI logic for the admin mockup
const state = {
  students: 0,
  courses : Courses,
  instructors : [],
  users: listUsers(),
  activities: [],
  payments: [],
  reviews: [],
  courseVideos: courseVideos
}


let admins = (state.users.filter((v) => v.role == `admin`))

state.instructors = (state.users.filter((v) => v.role == `admin`))

state.students = (state.users.length) - (admins.length)


let courseChooser = 0;


// DOM helpers
const $ = selector => document.querySelector(selector)
const $$ = selector => Array.from(document.querySelectorAll(selector))



$(`.profile`).innerHTML = `${getCurrentUser().name}`



let searchBar = $('#globalSearch');
synchronization_render()

function renderAdminPage(){

  state.activities = RecentActivities.load()

  let query = searchBar.value;
  $('#totalStudents').textContent = state.students;
  $('#totalCourses').textContent = state.courses.length;
  $('#totalInstructors').textContent = state.instructors.length;

  // render recent courses
  const tbody = $('#coursesTable tbody');
  tbody.innerHTML = '';
  state.courses.forEach(c => {
    const tr = document.createElement('tr')
    
    tr.innerHTML = `
      <td>${c.title}</td>
      <td>${c.instructor}</td>
      <td class="status status-${c.status.toLowerCase()}">${c.status}</td>
      <td>
        ${c.status !== 'Approved' ? `<button class="approve-btn btn" data-id="${c.id}">Approve</button>` : ''}
        ${c.status == 'Approved' ? `<button class="view-btn btn" data-id="${c.id}">View</button>` : ''}
      </td>
    `
    tbody.appendChild(tr);
  })

  // render courses in courses tab
  const coursesbody = $('#allCoursesTable tbody')
  coursesbody.innerHTML = ''
  let courses = ExploreSystem.searchCourses(state.courses, query);
  courses.forEach(c => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.title}</td>
      <td>${c.category}</td>
      <td>${Number(c.price)}$</td>
      <td>${c.students.length}</td>
      <td class="ri-star-fill" style="color:gold"> ${CourseFeedback.getAverageRating(c.id)}</td>
      <td class="status status-${c.status.toLowerCase()}">${c.status}</td>
      <td><button class="remove-course-btn btn danger" data-id="${c.id}">Remove</button></td>
    `
    coursesbody.appendChild(tr)
  })

  //render courseVideos in course settings tab


  const courseTitleName = $('.courseTitleName')
  const courseVideoTitle = state.courses.find(c => c.id === parseInt(courseChooser)) || {};
  courseTitleName.innerHTML = `
    <h2>${courseVideoTitle.title}</h2>
  `;
  courseTitleName.classList.add('hidden')

  const coursebody = $('#courseSettingTable tbody')
  coursebody.innerHTML = '';
  let course = state.courseVideos.find(c => c.id === courseChooser) || [];
  if(course.videos !== undefined){
    course.videos.forEach(v => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${v.videoTitle}</td>
        <td>${v.videoURL}</td>
      `
      coursebody.appendChild(tr)
    })
  }

  // render instructors in instructors tab
  const instructorsbody = $('#instructorsTable tbody')
  const comm = CommissionStorage.load();
  instructorsbody.innerHTML = ''
  let instructors = ExploreSystem.searchInstructor(state.instructors, query);

  let total = 0;
  instructors.forEach(instructor => {
    let totalWithoutCommission = getInstructorEarnings(instructor.id,comm)/(1-comm/100);
    total += totalWithoutCommission;
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
      <td>${getInstructorEarnings(instructor.id, comm)} $</td>
      <td>
        <!-- <button class="btn view-instructor" data-id="${instructor.id}">View</button> -->
        <a class="btn contact-instructor" data-email="${instructor.email}" href="mailto:${instructor.email}" style=text-decoration:none>Contact</a>
      </td>
    `;
    instructorsbody.appendChild(tr);
  })
  const rev = $(`#revenue`);
  rev.textContent=`${parseFloat(total.toFixed(2)*(comm/100))} $`

  // render students in students tab
  const studentsBody = $('#studentsTable tbody')
  studentsBody.innerHTML = '';
  let students = ExploreSystem.searchStudents(state.users, query);
  students.filter((v) => v.role == `student`).forEach(user => {
    
    const coursesListt = user.enrolledCourses
    .map(id => `${id} -> ${getCourse(id).title}`)
    .join('<br>');
      
      
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.password}</td>
      <td>${coursesListt ? coursesListt : "-"}</td>
      <td>${makeDateLookGood(user.lastActive)}</td>
    `
    studentsBody.appendChild(tr);
  })

  // render payments on payments tab
  const paymentsList = $('#paymentsTable tbody');
  paymentsList.innerHTML = ``;
  state.users.filter((u) => u.enrolledCourses).forEach(user =>{
      user.enrolledCourses.forEach(index =>{
        const tr = document.createElement(`tr`);
        tr.innerHTML=`
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${
          (function(){
            try{
              return getCourse(index).price 
            }catch(e){
              console.warn("Too bad broo..")
            }
          })()
        }
        </td>
        <td style="color: lightgreen">Done</td> 
        <td>${makeDateLookGood(getCourse(index).students.filter((d) => d[0] === user.id)[0][1])}</td>
        `
        paymentsList.appendChild(tr);
    });
  }) // About that done... lol
  


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
        <span><button class="remove-review-btn btn danger" data-id="${c.id}" data-userid="${f.userId}">Remove</button></span>
        <br><br>`;
        reviewsUl.appendChild(reviewLi);
      });
      
      reviewsList.appendChild(reviewsUl);
    } else {
      const noReviewsLi = document.createElement('li');
      noReviewsLi.innerHTML = `<em>No reviews yet</em> <br><br>`;
      reviewsList.appendChild(noReviewsLi);
    }
  });


  // activity
  const act = $('#activityList')
  act.innerHTML = ''
  state.activities.forEach(a=>{
    const li = document.createElement('li');
    li.innerHTML=`${a.activity} at <p class="activityDate">${makeDateLookGood(a.timestamp)}</p>`;
    act.appendChild(li)
  });
}


  searchBar.addEventListener('input', function() {
      renderAdminPage()
    }
  )


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

  debouncedRender()
}


function addNewVideo(title, url) {

  createVideo(courseChooser, url, title);

  debouncedRender()
}






// Event listener for new course button
$('#newCourseBtn').addEventListener('click', AddCourseModal);
$('#courseSettingBtn').addEventListener('click', ChooseCourseModal);
$('#courseVideoBtn').addEventListener('click', (e) =>{
  e.preventDefault();
  if(courseChooser === 0){
    return;
  }else{
    AddVideoModal()
  }
});



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
              <option value="Business">Business</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Design">Design</option>
              <option value="Cyber">Engineering</option>
              <option value="Medicine">Medicine</option>
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
    if (price <= 0){
      alert("Price must be greater than 0")
      return;
    }
    const duration = document.getElementById('courseDuration').value;
    if(duration <= 0){
      alert("Duration must be greater than 0")
      return;
    }
    const description = document.getElementById('courseDescription').value;
    
    if (title && instructor && category && price && duration && description) {
      addNewCourse(title, instructor, category, price,duration, description);
      RecentActivities.push(`New Course Added. (${title})`)
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


// Video Adding Modal

function AddVideoModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Add New Video</h2>
      <form id="addVideoForm">
        <div class="form-group">
          <label for="videoTitle">Video Title:</label>
          <input type="text" id="videoTitle" required>
        </div>


        <div class="form-group">
          <label for="videoURL">URL:</label>
          <input type="text" id="videoURL" required>
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

  modal.querySelector('#addVideoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('videoTitle').value;


    // Beshnack Search me
    const url = document.getElementById('videoURL').value;

    if (title && url) {
      addNewVideo(title, url);
      RecentActivities.push(`New Video Added. (${title})`)
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



// Course Setting Modal

function ChooseCourseModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Choose a course</h2>
      <form id="courseSettingForm">        
        <div class="form-group">
          <label for="course">Course:</label>
          <select id="course" required>
            <option value="">Select a course</option>
            ${state.courses.map(c => 
              `<option value="${c.id}">${c.title}</option>`
            ).join('')}
          </select>
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel btn danger">Cancel</button>
          <button type="submit" class="btn primary">Done</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);

  // Can't $ since this is from the modal, not the document
  modal.querySelector('.cancel').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.querySelector('#courseSettingForm').addEventListener('submit', (e) => {
    e.preventDefault();

    let courseID = document.getElementById('course').value;
    
    courseChooser = courseID

    document.body.removeChild(modal);

    synchronization_render()
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
   
    // deleteCourse(courseId);
    courseDeletion(courseId);
    debouncedRender()
  }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-course-btn')) {
    const courseId = parseInt(e.target.getAttribute('data-id'));
    RecentActivities.push(`Course Removed. (${getCourse(courseId).title})`)
    removeSpecificCourse(courseId);
  }
});

// Remove Function (Reviews)
function removeSpecificReview(courseId, userID) {
  if (confirm('Are you sure you want to remove this review?')) {
   
    CourseFeedback.deleteFeedback(courseId, userID)
    
    debouncedRender()
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
  });
}

// calculate instructor earnings

function getInstructorEarnings(instructorId, commission) {
  
  const instructor = state.instructors.find(i => i.id === instructorId);
  if (!instructor) return 0;

  let total = 0;

  instructor.courses.forEach(c => {
    const course = getCourse(c.id);
    const studentsCount = course.students.length;
    const price = course.price;

    total += (studentsCount * price) * (1 - commission/100);
  });

  return total;
}

function makeDateLookGood(str){
  
  const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{1,2}):(\d{1,2})/);
  if (!match) return null;

  const [
    _,
    y, m, d, h, min, s
  ] = match;

  return (
    `${y}-` +
    `${m.padStart(2, "0")}-` +
    `${d.padStart(2, "0")} ` +
    `${h.padStart(2, "0")}:` +
    `${min.padStart(2, "0")}:` +
    `${s.padStart(2, "0")}`
  );

}



// Event Listenenr to Approvals

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('approve-btn')) {
    const courseId = parseInt(e.target.getAttribute('data-id'));
    const course = state.courses.find(c => c.id === courseId);
    
    if (course && course.status != "Approved") {
      e.target.setAttribute(`disabled`, ``);
      course.status = "Approved";
      editCourse(courseId, course)
      RecentActivities.push(`Course Approved. (${course.title})`)
      debouncedRender()
    }
  }
});

document.addEventListener("click", (e) =>{
  if(e.target.classList.contains(`view-btn`)){
    const courseId = parseInt(e.target.getAttribute('data-id'));
    const course = courseList.find((course) => courseId === course.id);
    if (course) {
      window.location.href=`information.html?id=${courseId}`
      debouncedRender()
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
  debouncedRender()
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
      RecentActivities.push(`Instructor added. (${name})`)
      debouncedRender()
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

// Logout

const logoutButton = document.getElementById('logout-button');

logoutButton.addEventListener('click', () => {
    logout();
    alert(`Logout Successful.`);
    window.location.href = `login.html`
});

/* Settings */

const commission = $(`#commission`);
const btn = $(`#saveSettings`);

commission.setAttribute("value", CommissionStorage.load())

btn.addEventListener("click", () => {
  if (+commission.value.trim() === NaN || commission.value.trim().length === 0){
    return;
  }
  if (+commission.value < 0){
    commission.value = 0;
  }else if(+commission.value > 99){
    commission.value = 99;
  }
  RecentActivities.push(`Updated commission: ${commission.value}`)
  try{CommissionStorage.save(parseInt(commission.value));}catch(e){console.log(e)};
  debouncedRender()
});



/* Synchronizations */

function synchronization_render(){
  admins = (state.users.filter((v) => v.role == `admin`));
  state.instructors = (state.users.filter((v) => v.role == `admin`));
  syncAllInstructorCourses()
  CourseFeedback.syncWithCourseSystem()
  renderAdminPage()
}



renderAdminPage()
