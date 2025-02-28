const API_KEY = "6cab5121ad10fba99713fbf8d33bc57a";
const BASE_URL = "https://api.themoviedb.org/3";

const navbar = document.querySelector(".navbar");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const moviesContainer = document.getElementById("moviesContainer");
const trendingMoviesContainer = document.getElementById("trendingMoviesContainer");
const classicMoviesContainer = document.getElementById("classicMoviesContainer");
const watchlistMoviesContainer = document.getElementById("watchlistMoviesContainer");
const decadeSelect = document.getElementById("decadeSelect");

// Function to fetch trending movies from TMDb API
const fetchTrendingMovies = async () => {
    console.log("Fetching Trending Movies...");
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
        trendingMoviesContainer.appendChild(createMovieCard(movie, true));
    });
};

// Function to fetch classic movies
const fetchClassicMovies = async (decade) => {
    console.log("Fetching Classic Movies for decade:", decade);
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
        classicMoviesContainer.appendChild(createMovieCard(movie, true));
    });
};

// Function to fetch movies based on search query
const fetchMovies = async (query) => {
    console.log("Fetching movies for query:", query);
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
        moviesContainer.appendChild(createMovieCard(movie, true));
    });
};

// Function to create a movie card with a watchlist button
const createMovieCard = (movie, showWatchlistButton) => {
    // Ensure the full poster path is constructed correctly
    const posterPath = movie.poster_path 
        ? movie.poster_path.startsWith("https") 
            ? movie.poster_path // Already a full URL (for safety)
            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image';

    // Safely parse the rating
    const ratingNumber = parseFloat(movie.vote_average);
    const rating = !isNaN(ratingNumber) ? ratingNumber.toFixed(1) : "N/A";

    // Create the card
    const movieCard = document.createElement("div");
    movieCard.classList.add("col-md-3", "mb-4");
    movieCard.innerHTML = `
        <div class="card">
            <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
            <div class="card-body">
                <h5 class="card-title">${movie.title}</h5>
                <p class="card-text">Rating: ${rating}</p>
                ${
                  showWatchlistButton 
                  ? `<button 
                        class="btn btn-warning" 
                        onclick="addToWatchlist(${movie.id}, '${movie.title}', '${movie.poster_path}', '${movie.vote_average}')">
                        + Watchlist
                     </button>` 
                  : ''
                }
            </div>
        </div>
    `;
    return movieCard;
};


// Function to add a movie to the watchlist (store only the relative poster path)
const addToWatchlist = (id, title, posterPath, rating) => {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    // Store only the relative poster path in Local Storage
    const cleanPosterPath = posterPath && posterPath.includes("/t/p/") 
        ? posterPath.replace("https://image.tmdb.org/t/p/w500", "")
        : posterPath;

    // Convert rating to a float if possible; otherwise store "N/A"
    const ratingNumber = parseFloat(rating);
    const cleanRating = !isNaN(ratingNumber) ? ratingNumber.toFixed(1) : "N/A";

    // Only add if it doesn't already exist
    if (!watchlist.some(movie => movie.id === id)) {
        watchlist.push({ 
            id, 
            title, 
            poster_path: cleanPosterPath, 
            vote_average: cleanRating 
        });
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        console.log("Movie added to Watchlist:", title);
        loadWatchlist(); // Refresh watchlist immediately
    }
};

// Function to load and display watchlist movies (ensure poster URLs are corrected)
const loadWatchlist = () => {
    watchlistMoviesContainer.innerHTML = "";
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    if (watchlist.length === 0) {
        watchlistMoviesContainer.innerHTML = "<p class='text-center'>No movies in your watchlist.</p>";
        return;
    }

    watchlist.forEach(movie => {
        // Ensure the full poster URL is reconstructed before displaying
        movie.poster_path = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image';

        watchlistMoviesContainer.appendChild(createMovieCard(movie, false));
    });
};

// Load watchlist on page load
document.addEventListener("DOMContentLoaded", () => {
    loadWatchlist();
});
// Event Listener for Decade Selection Change
decadeSelect.addEventListener("change", (event) => {
    fetchClassicMovies(event.target.value);
});

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
    console.log("DOM fully loaded");
    fetchTrendingMovies();
    fetchClassicMovies(decadeSelect.value);
    loadWatchlist();
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
});
