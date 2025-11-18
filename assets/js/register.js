
import { register } from "./Modules/userSystem.js";



document.addEventListener('DOMContentLoaded', () => {
  const registerClose = document.getElementById('register-close');
  const registerForm = document.querySelector('.register__form');
  const toggleIcons = document.querySelectorAll('.toggle-password');
  const passwordBar = document.getElementById("register-password");
  let passwordDisplay = document.querySelector(`.password-rules`)
  const confirmpasswordBar = document.querySelector('#register-confirm')

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


  //Email!!!!
  const emailInput = document.querySelector("#register-email");

  emailInput.addEventListener("input", () => {
      if (emailRegex.test(emailInput.value)) {
          console.log("Valid email ✔️");
          emailInput.style.borderColor = "green";
      } else {
          console.log("Invalid email ❌");
          emailInput.style.borderColor = "red";
      }
  });




  // Password!!
  const rules = {
    length: (pw) => pw.length >= 8,
    uppercase: (pw) => /[A-Z]/.test(pw),
    number: (pw) => /[0-9]/.test(pw),
    symbol: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  };


  const ruleElements = document.querySelectorAll(".password-rules .rule");
  let isValid = false;

  passwordBar.addEventListener("focus",() =>{
    passwordDisplay.style.display = `block`;
    passwordDisplay.style.animation = `validationz 1s`;
  })

  passwordBar.addEventListener("blur",() =>{
    passwordDisplay.style.display=`none`
  })
  
  passwordBar.addEventListener("input", () => {

    const pw = passwordBar.value;
    isValid = true;

    ruleElements.forEach((ruleEl) => {
      const ruleName = ruleEl.dataset.rule;
      const passed = rules[ruleName](pw);

      ruleEl.classList.toggle("valid", passed);

      if (!passed) isValid = false;
    });

    passwordBar.style.borderColor = isValid ? "green" : "red";
  });


  // confirm password!!!

  confirmpasswordBar.addEventListener("input",() =>{
    if (passwordBar.value === confirmpasswordBar.value){
      confirmpasswordBar.style.borderColor = "green";
    }else{
      confirmpasswordBar.style.borderColor = "red";
    }
  });




  // close register form.
  if (registerClose) {
    registerClose.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }


  // toggle the on off eye 
  toggleIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const targetId = icon.getAttribute('data-target');
      const input = document.getElementById(targetId);

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('ri-eye-off-line', 'ri-eye-line');
      } else {
        input.type = 'password';
        icon.classList.replace('ri-eye-line', 'ri-eye-off-line');
      }
    });
  });


  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = document.getElementById('register-name').value.trim();
      const email = emailInput.value;
      const password = passwordBar.value
      const confirm = document.getElementById('register-confirm').value;

      if (!name || !email || !password || !confirm || !isValid) {
        alert('Please fill in all fields!');
        return;
      }

      if (password !== confirm) {
        alert('Passwords do not match!');
        return;
      }

      const newUser = {
        name,
        email,
        password,
      };

      register(newUser)

      alert('Registration Successful! Welcome aboard.');

      window.location.href = 'login.html';
    });
  }
});

document.addEventListener("mousemove", (e) => {
  const eyes = document.querySelectorAll(".eye");

  eyes.forEach((eye) => {
    const pupil = eye.querySelector(".pupil");
    const rect = eye.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
    const moveRadius = 4;
    const pupilX = Math.cos(angle) * moveRadius;
    const pupilY = Math.sin(angle) * moveRadius;

    pupil.style.transform = `translate(${pupilX}px, ${pupilY}px)`;
  });
});
