import { Feedback } from "./Modules/Feedback.js";
import { getCurrentUser } from "./Modules/userSystem.js";
import { updateUser } from "./Modules/userSystem.js";

//Submit feedback

let data = {};

let formy = document.querySelector(".footer-feedback");

formy.addEventListener("submit", function(e){
    data.name = formy[0].value;
    data.email = formy[1].value;
    data.message = formy[2].value;
    Feedback.submitFeedback(e, data)
    window.location.reload();
})


// Shortcut (For Admins!)
const keys = {};

if(getCurrentUser() != null){
  if(getCurrentUser().role == `admin`){
    document.addEventListener("keydown",(e) =>{
        keys[e.key.toLowerCase()] = true;
        if (keys["control"] && keys["alt"] && keys["a"]) {
            window.location.href=`admin/index.html`;
        }
    });
  }
}

if (getCurrentUser().role === "student"){
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      updateUser(getCurrentUser(), {lastActive: new Date()})
    }
  });
  window.addEventListener("blur", () => {
    updateUser(getCurrentUser(), {lastActive: new Date()})
  });
}




