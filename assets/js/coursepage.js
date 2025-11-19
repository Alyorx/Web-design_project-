// Modules
import { CourseInformation } from "./Modules/CourseInformation.js";
import { getUser } from "./Modules/userSystem.js";
import { getCurrentUser } from "./Modules/userSystem.js";
import { CourseFeedback } from "./Modules/CourseFeedback.js";

// References
const videoName = document.querySelector("h2.course-title");
const courseTitle = document.querySelector("h4.course-title");
const video = document.querySelector("#video-player");
const ratingStars = document.querySelectorAll(".rating span");
const comments = document.querySelector(".comment-list"); // Message to Tony -- Handle this with courseFeedback System
const submit = document.querySelector("#postComment");
const links = document.querySelectorAll(".course-sidebar a");
const starHolder = document.querySelector("#starHolder")
let selectedRating = -1; //indexing starts at 0 duhhh so must be -1


// Functions
function getCourseData(){
  return CourseInformation.courseInfo();
}

function submitComment(comment){
  let information = getCourseData();
  if(information.feedback.some((f) => f.userId === getCurrentUser().id.toString())){
    let rating = information.feedback.find((f) => f.userId === getCurrentUser().id.toString()).stars;
    let oldComment = information.feedback.find((f) => f.userId === getCurrentUser().id.toString()).comment;
  
    if(oldComment){
      CourseFeedback.updateFeedback(information.id, getCurrentUser().id.toString(), oldComment, rating) ? alert("You have already done a comment.") : alert("Something went wrong.")  
    }
  }else{
    CourseFeedback.addFeedback(information.id, getCurrentUser().id.toString(), comment, 0) ? alert("Commented Sucessfully!") : alert("Failed.")  
  }
  loadComments(getCourseData());
}


function renderRating(){
  let information = getCourseData();
  let rating = information.feedback.find((f) => f.userId === getCurrentUser().id.toString())?.stars || 0;
  ratingStars.forEach((s, index) => {
      s.classList.toggle("ri-star-fill", index <= rating-1); 
      s.classList.toggle("ri-star-line", index > rating-1);
  });
}


function loadComments(course){

  if (comments) {
    comments.innerHTML = '';
  }

  course.feedback.forEach((c) => {
    let x = getUser(c.userId);
    try{
      if(c.comment !== undefined && c.comment !== null){
        const newComment = document.createElement('p')
        newComment.innerHTML = `<strong>${x.name}:</strong> ${c.comment}`;
        comments.appendChild(newComment)
      }
    }catch(e){
      console.log(e);
    }
  });
}

function loadVideo(index){
  let information = getCourseData();
  videoName.innerHTML = `${information.title}`
  renderRating();
  courseTitle.innerHTML = `${CourseInformation.courseVideos[index][1]}`;
  video.querySelector("source").src = `${CourseInformation.videosURL}${CourseInformation.courseVideos[index][0]}`;
  video.load();
}

// Events
links.forEach((link, i) => {
  link.addEventListener("click", () => {
    links.forEach(l => l.removeAttribute("id"));
    link.id = "selected";
    loadVideo(i);
  });
});

submit.addEventListener("click" ,(e) => {
  e.preventDefault()
  let comment = document.querySelector("#commentInfo").value;
  if(comment.length === 0){
    alert("Comment is empty. Please Comment Seriously");
    return
  }
  submitComment(comment);
});


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
  });
});


try{
  loadVideo(0);
  loadComments(getCourseData());
  links[0].id = "selected";
}catch (e){
  console.log(e)
  window.location.href="errorpage.html"
}