
// Imports
import { CourseInformation } from "./Modules/CourseInformation.js";
import { getCurrentUser } from "./Modules/userSystem.js";
import { updateUser } from "./Modules/userSystem.js";
import { enrollUser } from "./Modules/courseSystem.js";

// DOM helper

const $ = Selector => document.querySelector(Selector);

// Selectors
const courseDetails = {
    title: $(`.course-details h2`),
    description : $(`.course-details p`),
    price : $(`.course-info strong`)
}
const submitBtn =  $(`.pay-btn`);
const inputs = document.getElementsByTagName(`input`);

const method = document.getElementById("payment-method");
const visaBox = document.getElementById("visa-box");
const paypalBox = document.getElementById("paypal-box");
const vodaBox = document.getElementById("vodafone-box");




// Functions

function getCourseData(){
    return CourseInformation.courseInfo();
}

function loadInfo(){
    const information = getCourseData();
    courseDetails.title.innerHTML = information.title;
    courseDetails.description.innerHTML = information.description;
    courseDetails.price.innerHTML = ` ${information.price} $`;
}

function validateForm(){
    let valid = true;
    for(let i = 0; i < 2; i++){
        if(inputs[i].length <= 0){
            valid = false;
        }
    }
    if (method.value === "visa"){

    }else if(method.value === "paypal"){

    }else if(method.value === "vodafone"){

    }else{
        valid = false;
    }      

}

function validateUser(){
    return getCurrentUser().enrolledCourses.includes(getCourseData().id);
}

function loadPage(){
    loadInfo();
}


loadPage();


// Events

method.addEventListener("change", () => {
    visaBox.style.display = "none";
    paypalBox.style.display = "none";
    vodaBox.style.display = "none";

    if (method.value === "visa") visaBox.style.display = "block";
    if (method.value === "paypal") paypalBox.style.display = "block";
    if (method.value === "vodafone") vodaBox.style.display = "block";
});


submitBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if(validateForm){
        if(validateUser()){
            window.location.href=`coursepage.html?id=${getCourseData().id}`
            return;
        }
        getCurrentUser().enrolledCourses.push(getCourseData().id);
        const newData = {enrolledCourses:getCurrentUser().enrolledCourses}
        updateUser(getCurrentUser(), newData);
        enrollUser(getCurrentUser().id, getCourseData().id);

        

        window.location.href=`coursepage.html?id=${getCourseData().id}`
    }
});

document.addEventListener("DOMContentLoaded", () =>{
    if(validateUser()){
        window.location.href=`information.html?id=${getCourseData().id}`
    }
});