// Modules
import { CourseInformation, courseVideos } from "./Modules/CourseInformation.js";
import { CourseFeedback,  } from "./Modules/CourseFeedback.js";
import { getUser } from "./Modules/userSystem.js";
import { getCurrentUser } from "./Modules/userSystem.js";

// References
const videoName = document.querySelector("h2.course-title");
const courseTitle = document.querySelector("h4.course-title");
const video = document.querySelector("#video-player");
//const comments = document.querySelector(".comment-list"); // Message to Tony -- Handle this with courseFeedback System
//const submit = document.querySelector("#postComment");
const links = document.querySelectorAll(".course-sidebar a");


// Functions
function getCourseData(){
  return CourseInformation.courseInfo();
}
/*
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
*/
function loadVideo(index){
  let information = getCourseData();
  videoName.innerHTML = `${information.title}`
  let videos = CourseInformation.getVideos(String(information.id));
  courseTitle.innerHTML = `${videos[index].videoTitle}`;

  const iframe = document.getElementById("video-player");
  const id = videos[index].videoURL;
  iframe.src = `https://player.vimeo.com/video/${id}?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479`;
}


function loadSidebar() {
  let information = getCourseData();
  const videoList = document.getElementById("videoList");
  videoList.innerHTML = "";

  const videos = CourseInformation.getVideos(String(information.id));

  if (!videos || videos.length === 0) {
    videoList.innerHTML = "<li>No videos available</li>";
    return;
  }

  videos.forEach((video, index) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.textContent = `Chapter ${index + 1}: ${video.videoTitle}`;
    a.href = "#";

    a[0] = "selected";

    a.addEventListener("click", (e) => {
      e.preventDefault();

      document
        .querySelectorAll(".course-sidebar a")
        .forEach(l => l.removeAttribute("id"));

      a.id = "selected";
      loadVideo(index);
    });

    li.appendChild(a);
    videoList.appendChild(li);

    // to load first element.
    if (index === 0) {
      a.id = "selected";
      loadVideo(0);
    }
  });
}



// Events
// links.forEach((link, i) => {
//   link.addEventListener("click", () => {
//     links.forEach(l => l.removeAttribute("id"));
//     link.id = "selected";
//     loadVideo(i);
//   });
// });

/*
submit.addEventListener("click" ,(e) => {
  e.preventDefault()
  let comment = document.querySelector("#commentInfo").value;
  if(comment.length === 0){
    alert("Comment is empty. Please Comment Seriously");
    return
  }
  submitComment(comment);
});
*/


try{
  loadSidebar()
  loadVideo(0);
  //links[0].id = "selected";
}catch (e){
  console.log(e)
  //window.location.href="errorpage.html"
}