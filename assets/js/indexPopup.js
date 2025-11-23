
import { logout } from "./Modules/userSystem.js";
import { login } from "./Modules/userSystem.js";
import { getCurrentUser } from "./Modules/userSystem.js";


// Main stuff



const mainPopup = document.createElement(`div`)
document.body.appendChild(mainPopup);


mainPopup.innerHTML=`
    <!-- ========== Login Popup ========== -->
    <div class="login__container" id="login-container">
        <div class="login__box">
            <i class="ri-close-line login__close" id="login-close"></i>
            <h2 class="login__title">Welcome Back</h2>
            <p class="login__subtitle">Login to continue your learning journey</p>
    
            <form class="login__form">
                <div class="login__input-box">
                    <input type="email" id="popupemail" required>
                    <label>Email</label>
                </div>
    
                <div class="login__input-box">
                    <input type="password" id="popuppassword" required>
                    <label>Password</label>
                </div>
    
                <button type="submit" class="login__btn" id="login--button">Login</button>
    
                <p class="login__register">
                    Don't have an account? <a href="register.html">Register</a>
                </p>
            </form>
        </div>
    </div>

    <!-- ========== Profile Popup ========== -->
    <div class="profile__container" id="profile-container">
        <div class="profile__box">
            <i class="ri-close-line profile__close" id="profile-close"></i>
            <h2 class="profile__title">Welcome Back</h2>
            <p class="profile__subtitle">Continue your learning journey</p>

            <button class="admin__btn" id="admin--button">Admin Dashboard</button>
            <button class="logout__btn" id="logout-button">Logout</button>
        </div>
    </div>
`



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


