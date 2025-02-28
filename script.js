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
