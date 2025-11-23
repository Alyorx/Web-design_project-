
// Imports
import { CourseInformation } from "./Modules/CourseInformation.js";
import { CourseFeedback } from "./Modules/CourseFeedback.js";
import { getCurrentUser } from "./Modules/userSystem.js";
import { getUser } from "./Modules/userSystem.js";
import { getRole } from "./Modules/userSystem.js";

// DOM helper
const $ = selector => document.querySelector(selector)
const $$ = selector => Array.from(document.querySelectorAll(selector))
const _ = (selector, i) => selector.children[i].children[1]; 


// References
const divDetail = $(`.details`);
const details = {
    instructor : _(divDetail,0),
    duration : _(divDetail,1),
    videos : _(divDetail,2),
    language : _(divDetail,3),
    price : _(divDetail,4),
    level : _(divDetail,5),
}

const title = $(`.hero h1`);
const description = $(`.hero p`);
const averageRating = $(`.rating`);
const ratingStars = document.querySelectorAll(".rating-section i");
const starHolder = document.querySelector("#course-stars")
let selectedRating = -1; //indexing starts at 0 duhhh so must be -1
const comments = document.querySelector("#comment-list"); // Message to Tony -- Handle this with courseFeedback System
const submit = document.querySelector("#postComment");
const enroll = document.querySelector(`.btn-enroll`)

console.log(CourseInformation.courseInfo());



// Functions

function getCourseData(){
    return CourseInformation.courseInfo();
}

function renderRating(){
  let information = getCourseData();
  let rating = information.feedback.find((f) => f.userId === getCurrentUser().id.toString())?.stars || 0;
  ratingStars.forEach((s, index) => {
      s.classList.toggle("ri-star-fill", index <= rating-1); 
      s.classList.toggle("ri-star-line", index > rating-1);
  });
}

function renderAverageRating() {
  
  const averageRatingNum = CourseFeedback.getAverageRating(getCourseData().id);
  averageRating.innerHTML = ''; 

  const fullStars = Math.floor(averageRatingNum);
  const hasHalfStar = averageRatingNum % 1 !== 0;
  const emptyStars = 5 - Math.ceil(averageRatingNum);

  const createStar = (iconName) => {
    const star = document.createElement(`i`);
    star.classList.add(iconName);
    averageRating.appendChild(star);
  };

  for (let i = 0; i < fullStars; i++) {
    createStar('ri-star-fill'); 
  }

  if (hasHalfStar) {
    createStar('ri-star-half-fill'); 
  }

  for (let i = 0; i < emptyStars; i++) {
    createStar('ri-star-line');
  }

  const ratingText = document.createElement(`span`);

  if(hasHalfStar){
    ratingText.innerHTML = ` ${averageRatingNum.toFixed(1)}/5`; 
  }else{
    ratingText.innerHTML = ` ${averageRatingNum}/5`;
  }
  averageRating.appendChild(ratingText); 
}

function submitComment(comment){
  let information = getCourseData();
  if(information.feedback.some((f) => f.userId === getCurrentUser().id.toString())){
    let rating = information.feedback.find((f) => f.userId === getCurrentUser().id.toString()).stars;
    let oldComment = information.feedback.find((f) => f.userId === getCurrentUser().id.toString()).comment;
    if(!comment){
      CourseFeedback.updateFeedback(information.id, getCurrentUser().id.toString(), oldComment, rating)
    }else{
      CourseFeedback.updateFeedback(information.id, getCurrentUser().id.toString(), comment, rating)
    }
  }else{
    CourseFeedback.addFeedback(information.id, getCurrentUser().id.toString(), comment, 0) ? alert("Commented Sucessfully!") : alert("Failed.")  
  }
  loadComments(getCourseData());
}

function loadInformationPage(){
  let information = getCourseData();

  title.innerHTML=`${information.title}`
  description.innerHTML=`${information.description}`
  details.instructor.innerHTML=`${information.instructor}`
  details.duration.innerHTML=`${information.duration} Weeks`
  details.videos.innerHTML=`5` // Temp for now.
  details.language.innerHTML=`English` // Temp for now.
  details.price.innerHTML=`$ ${information.price}`
  details.level.innerHTML=`${information.category}`
}

function loadComments(course){

  if (comments) {
    comments.innerHTML = '';
  }

  course.feedback.forEach((c) => {
    let x = getUser(c.userId);
    try{
      if(c.comment !== undefined && c.comment !== null){
        const newDiv = document.createElement(`div`)
        newDiv.classList.add(`comment`);
        const userComment = document.createElement(`strong`);
        userComment.innerHTML=`${x.name}:`
        const newComment = document.createElement('p')
        newComment.innerHTML = `${c.comment}`;
        newDiv.appendChild(userComment);
        newDiv.appendChild(newComment);
        comments.appendChild(newDiv);
      }
    }catch(e){
      console.log(e);
    }
  });
}

function loadPage(){
  loadInformationPage()
  renderRating()
  renderAverageRating()
  loadComments(getCourseData())
}


loadPage()



// Events


ratingStars.forEach((star, i) => {

  star.addEventListener("mouseenter", () => {
    ratingStars.forEach((s, index) => {
      s.classList.toggle("ri-star-fill", index <= i);
      s.classList.toggle("ri-star-line", index > i);
      console.log("amin", index)
    });
  });

  starHolder.addEventListener("mouseleave", () => {
    ratingStars.forEach((s, index) => {
      s.classList.toggle("ri-star-fill", index <= selectedRating); //should be selectedRating so it doesn't reset to 0 on mouse out
      s.classList.toggle("ri-star-line", index > selectedRating);
    });
    renderRating()
  });

  star.addEventListener("click", () => {
    selectedRating = i;
    let information = getCourseData();
    let comment = information.feedback.find((f) => f.userId === getCurrentUser().id.toString())?.comment || null;

    ratingStars.forEach((s, index) => {
      s.classList.toggle("ri-star-fill", index <= selectedRating);
      s.classList.toggle("ri-star-line", index > selectedRating);
    });
    if(information.feedback.some((f) => f.userId === getCurrentUser().id.toString())){
      CourseFeedback.updateFeedback(information.id, getCurrentUser().id.toString(), comment, selectedRating+1);
    }else{
      CourseFeedback.addFeedback(information.id, getCurrentUser().id.toString(), comment, selectedRating+1) ? alert("Rated Sucessfully!") : alert("Failed.")  
    }
    renderAverageRating()
  });
});

submit.addEventListener("click" ,(e) => {
  e.preventDefault()
  let comment = document.querySelector("#comment-input").value;
  if(comment.length === 0){
    alert("Comment is empty. Please Comment Seriously");
    return
  }
  submitComment(comment);
});


enroll.addEventListener("click",() =>{
  if(getRole() === `admin`){
    window.location.href=`coursepage.html?id=${getCourseData().id}`;
    window.location.href=`coursepage.html?id=${getCourseData().id}`;
    return
  }
  if(getCurrentUser().enrolledCourses.includes(getCourseData().id)){
    window.location.href=`coursepage.html?id=${getCourseData().id}`;
    return;
  }
  window.location.href=`purchase.html?id=${getCourseData().id}`;
});