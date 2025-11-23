// Imports
import { CourseInformation } from "./Modules/CourseInformation.js";
import { getCurrentUser, updateUser } from "./Modules/userSystem.js";
import { enrollUser } from "./Modules/courseSystem.js";

// DOM helper
const $ = selector => document.querySelector(selector);

// Selectors
const courseDetails = {
    title: $(".course-details h2"),
    description: $(".course-details p"),
    price: $(".course-info strong")
};

const submitBtn = $(".pay-btn");

const inputs = {
    basicDetails: [$("#formName"), $("#formEmail")],
    visaDetails: [$("#card-number"), $("#exp-date"), $("#cvv")],
    paypalDetails: [$("#paypalEmail")],
    vodafoneDetails: [$("#phoneNumber")]
};

const method = $("#payment-method");
const visaBox = $("#visa-box");
const paypalBox = $("#paypal-box");
const vodaBox = $("#vodafone-box");

// Functions
function loadInfo() {
    const info = getCourseData();
    courseDetails.title.innerHTML = info.title;
    courseDetails.description.innerHTML = info.description;
    courseDetails.price.innerHTML = ` ${info.price} $`;
}

function validateUser() {
    return getCurrentUser().enrolledCourses.includes(getCourseData().id);
}

const getCourseData = () => CourseInformation.courseInfo();

const Validation = {
    isNotEmpty: str => str.trim().length > 0,
    isEmail: str => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str),
    isDigitsLength: (str, length) => str.replace(/\D/g, "").length === length,
    isExactLength: (str, length) => str.length === length,

    validators: {
        basicDetails: [
            { inputIdx: 0, validate: str => Validation.isNotEmpty(str) },
            { inputIdx: 1, validate: str => str.trim().length < 0 || Validation.isEmail(str) }
        ],
        visaDetails: [
            { inputIdx: 0, validate: str => Validation.isDigitsLength(str, 12) },
            { inputIdx: 1, validate: str => Validation.isExactLength(str, 5) },
            { inputIdx: 2, validate: str => Validation.isNotEmpty(str) }
        ],
        vodafoneDetails: [
            { inputIdx: 0, validate: str => Validation.isDigitsLength(str, 11) }
        ],
        paypalDetails: [
            { inputIdx: 0, validate: str => str.trim().length < 0 || Validation.isEmail(str) }
        ]
    },

    attachLiveValidation(input, validator) {
        input.addEventListener("input", () => {
            input.style.border = validator(input.value) ? "2px solid lightgreen" : "2px solid red";
        });
    },

    checkGroup(groupName) {
        let valid = true;
        const groupInputs = inputs[groupName];
        const rules = this.validators[groupName];

        if (!groupInputs || !rules) return false;

        rules.forEach(rule => {
            const input = groupInputs[rule.inputIdx];
            const inputValid = rule.validate(input.value);
            input.style.border = inputValid ? "2px solid lightgreen" : "2px solid red";
            valid = valid && inputValid;
        });

        return valid;
    },

    validateForm() {
        let valid = true;

        valid = this.checkGroup("basicDetails") && valid;

        const paymentMethods = {
            visa: "visaDetails",
            paypal: "paypalDetails",
            vodafone: "vodafoneDetails"
        };

        const groupName = paymentMethods[method.value];
        if (groupName) {
            valid = this.checkGroup(groupName) && valid;
        } else {
            valid = false;
        }

        return valid;
    },

    formatters: {
        visaNumber(input) {
            input.addEventListener("input", () => {
                let digits = input.value.replace(/\D/g, "").substring(0, 16);
                input.value = digits.replace(/(.{4})/g, "$1 ").trim();
            });
        },
        visaExpiry(input) {
            input.addEventListener("input", () => {
                let v = input.value.replace(/\D/g, "");
                if (v.length >= 1 && v[0] > 1) v = "0" + v[0];
                if (v.length >= 2) {
                    const month = Number(v.substring(0, 2));
                    if (month < 1) v = "01" + v.substring(2);
                    if (month > 12) v = "12" + v.substring(2);
                }
                if (v.length > 2) v = v.substring(0, 2) + "/" + v.substring(2, 4);
                input.value = v;
            });
        },
        vodafoneNumber(input) {
            input.addEventListener("input", () => {
                let v = input.value.replace(/\D/g, "");
                if (!v.startsWith("01")) v = "01" + v.replace(/^0+/, "");
                v = v.substring(0, 11);
                if (v.length > 3) v = v.replace(/^(\d{3})(\d)/, "$1 $2");
                if (v.length > 7) v = v.replace(/^(\d{3})\s(\d{4})(\d)/, "$1 $2 $3");
                input.value = v;
            });
        }
    },

    attachAll() {
        Object.keys(inputs).forEach(groupName => {
            const groupInputs = inputs[groupName];
            const rules = this.validators[groupName];
            if (!groupInputs || !rules) return;

            rules.forEach(rule => {
                const input = groupInputs[rule.inputIdx];
                if (!input) return;

                this.attachLiveValidation(input, rule.validate);

                if (groupName === "visaDetails" && rule.inputIdx === 0) this.formatters.visaNumber(input);
                if (groupName === "visaDetails" && rule.inputIdx === 1) this.formatters.visaExpiry(input);
                if (groupName === "vodafoneDetails" && rule.inputIdx === 0) this.formatters.vodafoneNumber(input);
            });
        });
    },

    onload(currentUser){
        inputs.basicDetails[0].value = currentUser.name;
        inputs.basicDetails[1].value = currentUser.email;
        this.validateForm();
    }
};


// Events
method.addEventListener("change", () => {
    visaBox.style.display = paypalBox.style.display = vodaBox.style.display = "none";
    if (method.value === "visa") visaBox.style.display = "block";
    if (method.value === "paypal") paypalBox.style.display = "block";
    if (method.value === "vodafone") vodaBox.style.display = "block";
});

submitBtn.addEventListener("click", e => {
    e.preventDefault();

    if (!Validation.validateForm()) {
        alert("Please fill in all required fields correctly.");
        return;
    }

    if (validateUser()) {
        window.location.href = `coursepage.html?id=${getCourseData().id}`;
        return;
    }

    const currentUser = getCurrentUser();
    currentUser.enrolledCourses.push(getCourseData().id);
    updateUser(currentUser, { enrolledCourses: currentUser.enrolledCourses });
    enrollUser(currentUser.id, getCourseData().id);

    window.location.href = `coursepage.html?id=${getCourseData().id}`;
});

document.addEventListener("DOMContentLoaded", () => {
    loadInfo();
    Validation.onload(getCurrentUser());
    Validation.attachAll();
    if (validateUser()) {
        window.location.href = `information.html?id=${getCourseData().id}`;
    }
});