
import { logout } from "./Modules/userSystem.js";
import { login } from "./Modules/userSystem.js";
import { getCurrentUser } from "./Modules/userSystem.js";

/* LOGIN/LOGOUT POPUP */
const loginContainer = document.getElementById('login-container');
const loginIcon = document.getElementById('login-button');
const loginButton = document.getElementById('login--button');
const loginClose = document.getElementById('login-close');



loginButton.addEventListener('click', (e) => {
    const email = document.querySelector(`#popupemail`).value;
    const password = document.querySelector(`#popuppassword`).value;
    if (!login(email, password)){
        alert(`Login Failed! Please try again.`)
    }
});

loginIcon.addEventListener('click', () => {
    
    if(getCurrentUser() !== null){
        profileContainer.classList.add('active');
    }else{
        loginContainer.classList.add('active');
    }
});

loginClose.addEventListener('click', () => {
    loginContainer.classList.remove('active');
});

window.addEventListener('click', (e) => {
    if (e.target === loginContainer) {
        loginContainer.classList.remove('active');
    }
});


/* PROFILE POPUP */
const profileContainer = document.getElementById('profile-container');
const logoutButton = document.getElementById('logout-button');
const profileClose = document.getElementById('profile-close');
const profileTitle = document.querySelector(`.profile__title`);
const adminButton = document.querySelector(`.admin__btn`)

logoutButton.addEventListener('click', () => {
    logout();
    window.location.href="login.html"
});

if (getCurrentUser().role === `admin`){
    profileTitle.innerHTML = `<h2 class="profile__title">Welcome back, ${getCurrentUser().name}</h2>`
}else{
    profileTitle.innerHTML = `<h2 class="profile__title">Welcome back, ${getCurrentUser().name}</h2>`
    adminButton.style.display = `none`
}


adminButton.addEventListener(`click`, () =>{
    window.location.href=`admin/index.html`
})

/* Profile close*/
profileClose.addEventListener('click', () => {
    profileContainer.classList.remove('active');
});

window.addEventListener('click', (e) => {
    if (e.target === profileContainer) {
        profileContainer.classList.remove('active');
    }
});

