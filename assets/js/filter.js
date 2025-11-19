// Imports
import { courseList } from "./Modules/courseSystem.js";
import { ExploreSystem } from "./Modules/ExploreSystem.js";

// References
const paginationContainer = document.getElementById("pagination");
let courses = courseList;

// Pagination State
const limitPerPage = 4;
let currentPage = 1;
let totalPages = 1;

// Functions
function createCourseFilterItem({ title, category, price, duration, id }) {
    // wrapper div
    const div = document.createElement("div");
    div.className = "course-item-filter";
    div.dataset.category = category;
    div.dataset.price = price;
    div.dataset.duration = duration;

    // image
    const img = document.createElement("img");
    img.src = "assets/img/aaa.png";
    img.alt = title;

    // title
    const h3 = document.createElement("h3");
    h3.textContent = title;

    // price
    const pPrice = document.createElement("p");
    pPrice.textContent = `Price: ${price}`;

    // duration
    const pDuration = document.createElement("p");
    pDuration.textContent = `Duration: ${duration}`;

    // button
    const button = document.createElement("button");
    button.textContent = "Visit Now";
    button.addEventListener("click", () => {
        window.location.href = `coursepage.html?id=${id}`;
    });

    // append children
    div.appendChild(img);
    div.appendChild(h3);
    div.appendChild(pPrice);
    div.appendChild(pDuration);
    div.appendChild(button);

    return div;
}

function renderFilteredCourses(courseList, page, limit) {
    const approved = courseList.filter(c => c.status === "Approved");
    const paginationInfo = ExploreSystem.pagination(approved, page, limit);

    totalPages = paginationInfo.totalPages;

    const container = document.querySelector(".courses-container-filter");
    container.innerHTML = "";

    for (const c of paginationInfo.data) {
        const element = createCourseFilterItem({
            category: c.category,
            title: c.title,
            price: `${c.price}$`,
            duration: `${c.duration} Weeks`,
            id: c.id
        });
        container.appendChild(element);
    }
}

function renderPagination(filteredList = courses) {
    paginationContainer.innerHTML = "";

    const pag = document.createElement("div");
    pag.className = "pagination";

    // Prev
    const prev = document.createElement("button");
    prev.className = "btn box prev";
    prev.innerHTML = `<i class="ri-arrow-left-line"></i>`;
    prev.disabled = currentPage === 1;

    if(prev.disabled){
        prev.style.display=`none`;
    }

    prev.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderFilteredCourses(filteredList, currentPage, limitPerPage);
            renderPagination(filteredList);
        }
    };

    pag.appendChild(prev);

    // Create Button
    function createPageButton(num) {
        const btn = document.createElement("button");
        btn.className = "box";
        btn.textContent = num;

        if (num === currentPage) btn.classList.add("active");

        btn.onclick = () => {
            currentPage = num;
            renderFilteredCourses(filteredList, currentPage, limitPerPage);
            renderPagination(filteredList);
        };

        pag.appendChild(btn);
    }

    // first page
    if (totalPages >= 1) createPageButton(1);

    // left dots
    if (currentPage > 3) {
        const dots = document.createElement("button");
        dots.className = "dots";
        dots.textContent = "...";
        pag.appendChild(dots);
    }

    // middle range
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
        createPageButton(i);
    }

    // right dots
    if (currentPage < totalPages - 2) {
        const dots = document.createElement("button");
        dots.className = "dots";
        dots.textContent = "...";
        pag.appendChild(dots);
    }

    // last page
    if (totalPages > 1) createPageButton(totalPages);

    // Next
    const next = document.createElement("button");
    next.className = "btn box next";
    next.innerHTML = `<i class="ri-arrow-right-line"></i>`;
    next.disabled = currentPage === totalPages;

    if(next.disabled){
        next.style.display=`none`;
    }

    next.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderFilteredCourses(filteredList, currentPage, limitPerPage);
            renderPagination(filteredList);
        }
    };

    pag.appendChild(next);
    paginationContainer.appendChild(pag);
}


// Initializaiton
renderFilteredCourses(courses, currentPage, limitPerPage);
renderPagination(courses);

// Events
document.getElementById('applyFilter').addEventListener('click', () => {
    // Input
    const category = document.getElementById('categoryFilter').value;
    const price = document.getElementById('priceFilter').value;
    const duration = document.getElementById('durationFilter').value;

    // Filteration
    const criteria = {};

    if (category !== "all") criteria.category = category;

    if (price !== "all") {
        if (price[0] === 'u') {
            criteria.maxPrice = parseInt(price.substring(1));
        } else if (price[0] === 'g') {
            criteria.minPrice = parseInt(price.substring(1));
        }
    }

    if (duration !== "all") {
        switch (duration) {
            case "short": criteria.maxDuration = 2; break;
            case "medium": criteria.maxDuration = 8; break;
            case "long": criteria.minDuration = 8; break;
        }
    }

    const filteredCourses = ExploreSystem.filterCourses(courses, criteria);

    currentPage = 1;

    renderFilteredCourses(filteredCourses, currentPage, limitPerPage);
    renderPagination(filteredCourses);
});