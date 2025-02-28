document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    
    // Function to handle navbar background on scroll
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
});

const API_KEY = "6cab5121ad10fba99713fbf8d33bc57a";
const BASE_URL = "https://api.themoviedb.org/3";