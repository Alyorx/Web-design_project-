
import { login } from "./Modules/userSystem.js"
import { getCurrentUser } from "./Modules/userSystem.js"






function submittingInfo(){
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email || !password) {
    alert('Please fill in all fields!');
    return;
  }

  if(!login(email, password)){
    alert(`Invalid Data! Please enter the correct email or password.`)
    return;
  }

  if(getCurrentUser().role === `admin`){
    window.location.href = "admin/index.html"
    return
  }
  window.location.href = "index.html";
  return
}



if(getCurrentUser() != null){
  window.location.href = `index.html`;
}

document.getElementById('login-email').addEventListener("keydown",(e) =>{
  if(e.key === `Enter`){
    document.getElementById('login-password').focus();
  }
});
document.getElementById('login-password').addEventListener("keydown",(e) =>{
  if(e.key === `Enter`){
    submittingInfo();
  }
});




const togglePasswordIcons = document.querySelectorAll('.toggle-password');

togglePasswordIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    const targetInput = document.getElementById(icon.dataset.target);
    if (targetInput.type === 'password') {
      targetInput.type = 'text';
      icon.classList.replace('ri-eye-off-line', 'ri-eye-line');
    } else {
      targetInput.type = 'password';
      icon.classList.replace('ri-eye-line', 'ri-eye-off-line');
    }
  });
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  submittingInfo();
});

document.getElementById('login-close').addEventListener('click', () => {
  document.getElementById('login-container').style.display = 'none';
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