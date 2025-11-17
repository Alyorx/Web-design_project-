import { courseList } from "./Modules/courseSystem.js"
import { ExploreSystem } from "./Modules/ExploreSystem.js";

const searchInput = document.querySelector(".search-bar input");
const allCourses = [
  ...document.querySelectorAll(".course-item"),
  ...document.querySelectorAll(".course-item-filter")
];

const searchBar = document.querySelector(".search-bar");
searchBar.style.position = "relative";

const suggestionBox = document.createElement("div");
suggestionBox.style.position = "absolute";
suggestionBox.style.top = "100%";
suggestionBox.style.left = "0";
suggestionBox.style.width = "100%";
suggestionBox.style.background = "#fff";
suggestionBox.style.border = "1px solid #ddd";
suggestionBox.style.borderRadius = "6px";
suggestionBox.style.maxHeight = "250px";
suggestionBox.style.overflowY = "auto";
suggestionBox.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
suggestionBox.style.zIndex = "999";
suggestionBox.style.display = "none";
searchBar.appendChild(suggestionBox);

searchInput.addEventListener("input", () => {
    const query = searchInput.value;
    suggestionBox.innerHTML = "";
    console.log(query);
    console.log("Event Activated");

    if (!query) {
        suggestionBox.style.display = "none";
        allCourses.forEach(c => c.style.display = "block");
        return;
    }

    const matched = ExploreSystem.searchCourses(courseList.filter(course => course.status === "Approved"), query);


    if (matched.length) {
        matched.forEach(course => {
            const title = course.title;
            const imgSrc = "assets/img/aaa.png";

            const item = document.createElement("div");
            item.style.display = "flex";
            item.style.alignItems = "center";
            item.style.padding = "8px 12px";
            item.style.cursor = "pointer";
            item.style.transition = "background 0.2s";
            item.innerHTML = `<img src="${imgSrc}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;margin-right:10px;"> <span>${title}</span>`;

            item.addEventListener("mouseover", () => item.style.background = "#f0f0f0");
            item.addEventListener("mouseout", () => item.style.background = "transparent");

            item.addEventListener("click", () => {
                window.location.href = `coursepage.html?id=${course.id}`;
            });

            suggestionBox.appendChild(item);
        });
        suggestionBox.style.display = "block";
    } else {
        suggestionBox.style.display = "none";
        // allCourses.forEach(c => c.style.display = "none");
    }
});

searchInput.addEventListener("blur", () => {
    setTimeout(() => suggestionBox.style.display = "none", 150);
});
