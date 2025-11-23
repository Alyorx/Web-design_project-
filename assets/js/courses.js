/*
    Todo:
    1. Ensure Visits in CourseList --> ASK JANA
    2. Ensure Visits are equal to 0 during creation --> ASK TONY 
*/

// Imports
import { courseList } from "./Modules/courseSystem.js"
import { ExploreSystem } from "./Modules/ExploreSystem.js";
import { getCurrentUser } from "./Modules/userSystem.js"

// References
let courses = courseList;

// Functions
function createCourseItem({category, title, description, id, enrolled}) {
    // Create article
    const article = document.createElement("article");
    article.className = "course-item swiper-slide";

    // IMG
    const img = document.createElement("img");
    img.src = "assets/img/aaa.png";
    img.alt = "course image";
    img.className = "course-image";
    img.dataset.category = category;
    img.dataset.level = "beginner";

    // Title
    const h3 = document.createElement("h3");
    h3.textContent = title;

    // Description
    const p = document.createElement("p");
    p.textContent = description;

    // Button
    const a = document.createElement("a");
    //a.href = `coursepage.html?id=${id}`; takes you to a video
    a.href = `information.html?id=${id}`
    a.className = "button";
    a.textContent = enrolled ? "Visit" : "Enroll Now";

    // Append children
    article.appendChild(img);
    article.appendChild(h3);
    article.appendChild(p);
    article.appendChild(a);

    return article;
}

function renderCourses(courses){
    // Data
    const user = getCurrentUser();
    const userCourses = user.enrolledCourses

    // Rendering
    for (const course of courses){
    const courseInfo = {
        category: course.category,
        title: course.title,
        description: course.description,
        id: course.id,
        enrolled: userCourses.includes(course.id)
    };

    const articleElement = createCourseItem(courseInfo);

    document.querySelector(".swiper-wrapper").appendChild(articleElement);
}
}

renderCourses(ExploreSystem.getTrending(courses.filter(c => c.status == `Approved`)));

// Initialize Swiper
const coursesSwiper = new Swiper(".courses__swiper", {
    slidesPerView: 3,
    spaceBetween: 50,
    loop: true,
    grabCursor: true,
    centeredSlides: false,
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    breakpoints: {
        320: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
    },
});
