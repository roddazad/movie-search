const API_KEY = "6cab5121ad10fba99713fbf8d33bc57a";
const BASE_URL = "https://api.themoviedb.org/3";

const navbar = document.querySelector(".navbar");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const moviesContainer = document.getElementById("moviesContainer");
const trendingMoviesContainer = document.getElementById("trendingMoviesContainer");
const classicMoviesContainer = document.getElementById("classicMoviesContainer");
const decadeSelect = document.getElementById("decadeSelect");

// Function to fetch trending movies from TMDb API
const fetchTrendingMovies = async () => {
    console.log("Fetching Trending Movies..."); // Debugging Log
    const url = `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayTrendingMovies(data.results);
    } catch (error) {
        console.error("Error fetching trending movies:", error);
    }
};

// Function to display trending movies
const displayTrendingMovies = (movies) => {
    trendingMoviesContainer.innerHTML = "";
    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("trending-movie-card");
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="card-body">
                <h5>${movie.title}</h5>
                <p>Rating: ${movie.vote_average}</p>
            </div>
        `;
        trendingMoviesContainer.appendChild(movieCard);
    });
};

// Fetch Classic Movies from TMDb API based on selected decade
const fetchClassicMovies = async (decade) => {
    console.log("Fetching Classic Movies for decade:", decade); // Debugging Log
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${decade}-01-01&primary_release_date.lte=${parseInt(decade) + 9}-12-31&sort_by=vote_average.desc`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayClassicMovies(data.results);
    } catch (error) {
        console.error("Error fetching classic movies:", error);
    }
};

// Function to display classic movies
const displayClassicMovies = (movies) => {
    classicMoviesContainer.innerHTML = "";
    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("classic-movie-card");
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <div class="card-body">
                <h5>${movie.title}</h5>
                <p>Rating: ${movie.vote_average}</p>
            </div>
        `;
        classicMoviesContainer.appendChild(movieCard);
    });
};

// Function to fetch movies based on search query
const fetchMovies = async (query) => {
    console.log("Fetching movies for query:", query); // Debugging Log
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
};

// Function to display search results
const displayMovies = (movies) => {
    moviesContainer.innerHTML = "";
    if (!movies || movies.length === 0) {
        moviesContainer.innerHTML = "<p class='text-center'>No movies found.</p>";
        return;
    }
    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("col-md-3", "mb-4");
        movieCard.innerHTML = `
            <div class="card">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                    <p class="card-text">Rating: ${movie.vote_average}</p>
                </div>
            </div>
        `;
        moviesContainer.appendChild(movieCard);
    });
};

// Event Listener for Search Button
searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
        fetchMovies(query);
    } else {
        console.log("Search input is empty");
    }
});

// Event Listener for Enter Key in Search Input
searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const query = searchInput.value.trim();
        if (query) {
            fetchMovies(query);
        }
    }
});

// Ensure DOM is loaded before running scripts
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded"); // Debugging Log
    fetchTrendingMovies();
    fetchClassicMovies(decadeSelect.value);
    
    // Navbar Scroll Effect
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
});
