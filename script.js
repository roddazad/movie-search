const API_KEY = "6cab5121ad10fba99713fbf8d33bc57a";
const BASE_URL = "https://api.themoviedb.org/3";

// DOM Elements
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const moviesContainer = document.getElementById("moviesContainer");
const trendingMoviesContainer = document.getElementById("trendingMoviesContainer");
const classicMoviesContainer = document.getElementById("classicMoviesContainer");
const watchlistMoviesContainer = document.getElementById("watchlistMoviesContainer");
const decadeSelect = document.getElementById("decadeSelect");

// Update footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Fetch Trending Movies
async function fetchTrendingMovies() {
    const url = `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMoviesInCarousel(data.results, trendingMoviesContainer, "trendingMoviesCarousel");
    } catch (error) {
        console.error("Error fetching trending movies:", error);
    }
}

// Fetch Classic Movies
async function fetchClassicMovies(decade) {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&primary_release_date.gte=${decade}-01-01&primary_release_date.lte=${parseInt(decade) + 9}-12-31&sort_by=vote_average.desc`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMoviesInCarousel(data.results, classicMoviesContainer, "classicMoviesCarousel");
    } catch (error) {
        console.error("Error fetching classic movies:", error);
    }
}

// Function to display movies inside a carousel
function displayMoviesInCarousel(movies, container, carouselId) {
    container.innerHTML = "";
    
    let slides = "";
    for (let i = 0; i < movies.length; i += 3) {
        let activeClass = i === 0 ? "active" : "";
        let movieGroup = movies.slice(i, i + 3);

        slides += `
            <div class="carousel-item ${activeClass}">
                <div class="container">
                    <div class="row d-flex justify-content-center">
                        ${movieGroup.map(movie => `
                            <div class="col-lg-4 col-md-6 col-12 d-flex justify-content-center">
                                ${createMovieCard(movie, true).outerHTML}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }

    container.innerHTML = slides;
    
    // Hide carousel controls if there aren't enough movies
    const carouselControls = document.querySelector(`#${carouselId} .carousel-control-prev, #${carouselId} .carousel-control-next`);
    if (movies.length <= 3) {
        carouselControls.style.display = "none";
    } else {
        carouselControls.style.display = "block";
    }
}

// Function to create a movie card
function createMovieCard(movie, showWatchlistButton) {
    const posterPath = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image';
    
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
        <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
        <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
            <p class="card-text">Rating: ${movie.vote_average.toFixed(1)}</p>
            ${showWatchlistButton ? `<button class="btn btn-warning watchlist-btn" data-movie='${JSON.stringify(movie)}'>+ Watchlist</button>` : ''}
        </div>`;
    return card;
}

// Fetch movies based on search query
async function fetchMovies(query) {
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        displaySearchResults(data.results);
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// Display Search Results
function displaySearchResults(movies) {
    moviesContainer.innerHTML = "";
    if (movies.length === 0) {
        moviesContainer.innerHTML = "<p class='text-center'>No movies found.</p>";
        return;
    }
    movies.forEach(movie => moviesContainer.appendChild(createMovieCard(movie, true)));
}

// Handle Watchlist
function addToWatchlist(movie) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    if (!watchlist.some(m => m.id === movie.id)) {
        watchlist.push(movie);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        loadWatchlist();
    }
}

function loadWatchlist() {
    watchlistMoviesContainer.innerHTML = "";
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    if (watchlist.length === 0) {
        watchlistMoviesContainer.innerHTML = "<p class='text-center'>No movies in your watchlist.</p>";
        return;
    }
    watchlist.forEach(movie => {
        let movieCard = createMovieCard(movie, false);
        let removeButton = document.createElement("button");
        removeButton.classList.add("btn", "btn-danger", "remove-btn");
        removeButton.textContent = "Remove";
        removeButton.onclick = () => removeFromWatchlist(movie.id);
        movieCard.querySelector(".card-body").appendChild(removeButton);
        watchlistMoviesContainer.appendChild(movieCard);
    });
}

function removeFromWatchlist(movieId) {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    watchlist = watchlist.filter(movie => movie.id !== movieId);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    loadWatchlist();
}

// Event Listeners
decadeSelect.addEventListener("change", (event) => fetchClassicMovies(event.target.value));
searchButton.addEventListener("click", () => fetchMovies(searchInput.value.trim()));
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("watchlist-btn")) {
        addToWatchlist(JSON.parse(event.target.getAttribute("data-movie")));
    }
});

document.addEventListener("DOMContentLoaded", () => {
    fetchTrendingMovies();
    fetchClassicMovies(decadeSelect.value);
    loadWatchlist();
});
