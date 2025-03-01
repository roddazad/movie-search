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

// Update footer year dynamically
document.getElementById("year").textContent = new Date().getFullYear();

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

// Function to create a movie card with an optional grid wrapper
const createMovieCard = (movie, showWatchlistButton, inCarousel = false) => {
    // Ensure the full poster path is constructed correctly
    const posterPath = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image';

    // Safely parse the rating
    const ratingNumber = parseFloat(movie.vote_average);
    const rating = !isNaN(ratingNumber) ? ratingNumber.toFixed(1) : "N/A";

    // Create the card container element
    const container = document.createElement("div");

    // Add grid classes if NOT in carousel mode
    if (!inCarousel) {
        container.classList.add("col-md-3", "mb-4");
    }
    
    container.innerHTML = `
        <div class="card">
            <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
            <div class="card-body">
                <h5 class="card-title">${movie.title}</h5>
                <p class="card-text">Rating: ${rating}</p>
                ${showWatchlistButton ? `<button class="btn btn-warning watchlist-btn">+ Watchlist</button>` : ''}
            </div>
        </div>
    `;

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("watchlist-btn")) {
            // Find the closest movie card and extract details
            const movieCard = event.target.closest(".card");
            const title = movieCard.querySelector(".card-title").textContent;
            const rating = movieCard.querySelector(".card-text").textContent.replace("Rating: ", "");
            const posterPath = movieCard.querySelector(".card-img-top").getAttribute("src");
    
            // Generate a unique ID based on title (since we don't get an ID from TMDB in this function)
            const movieId = title.toLowerCase().replace(/\s+/g, "-");
    
            addToWatchlist(movieId, title, posterPath, rating);
        }
    });

    return container;
};


// Function to display trending movies inside the carousel
const displayTrendingMovies = (movies) => {
    trendingMoviesContainer.innerHTML = "";

    let slides = "";
    for (let i = 0; i < movies.length; i += 4) {
        let activeClass = i === 0 ? "active" : "";
        let movieGroup = movies.slice(i, i + 4);
        while (movieGroup.length < 6) {
            movieGroup.push({ title: "Placeholder", poster_path: null, vote_average: "N/A" });
        }

        slides += `
            <div class="carousel-item ${activeClass}">
                <div class="container">
                    <div class="row d-flex justify-content-center gx-3">
                        ${movieGroup.map(movie => `
                            <div class="col-4 d-flex justify-content-center align-items-stretch">
                                ${createMovieCard(movie, true, true).outerHTML}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }

    trendingMoviesContainer.innerHTML = slides;
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

    let slides = "";
    for (let i = 0; i < movies.length; i += 4) {
        let activeClass = i === 0 ? "active" : "";
        let movieGroup = movies.slice(i, i + 4);

        // Ensure exactly 4 movies per slide by adding placeholders if needed
        while (movieGroup.length < 6) {
            movieGroup.push({ title: "Placeholder", poster_path: null, vote_average: "N/A" });
        }

        slides += `
            <div class="carousel-item ${activeClass}">
                <div class="container">
                    <div class="row d-flex justify-content-center gx-3">
                        ${movieGroup.map(movie => `
                            <div class="col-4 d-flex justify-content-center align-items-stretch">
                                ${createMovieCard(movie, true, true).outerHTML}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }

    classicMoviesContainer.innerHTML = slides;
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

// Function to remove a movie from the watchlist
const removeFromWatchlist = (id) => {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    watchlist = watchlist.filter(movie => movie.id !== id);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    loadWatchlist();
};

// Function to add a movie to the watchlist
const addToWatchlist = (id, title, posterPath, rating) => {
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    // Ensure the movie isn't already in the watchlist
    if (!watchlist.some(movie => movie.id === id)) {
        watchlist.push({ id, title, poster_path: posterPath, vote_average: rating });
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        console.log("Movie added to Watchlist:", title);
        loadWatchlist(); // Refresh watchlist immediately
    }
};

// Function to load and display watchlist movies
const loadWatchlist = () => {
    watchlistMoviesContainer.innerHTML = "";
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    if (watchlist.length === 0) {
        watchlistMoviesContainer.innerHTML = "<p class='text-center'>No movies in your watchlist.</p>";
        return;
    }

    watchlist.forEach(movie => {
        let posterPath = movie.poster_path
            ? (movie.poster_path.startsWith("https") 
                ? movie.poster_path  // Already a full URL
                : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
            : 'https://via.placeholder.com/500x750?text=No+Image';

        const movieCard = document.createElement("div");
        movieCard.classList.add("col-md-3", "mb-4", "fade-in");
        movieCard.innerHTML = `
            <div class="card">
                <img src="${posterPath}" class="card-img-top" alt="${movie.title}">
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                    <button class="btn btn-danger remove-btn">Remove</button>
                </div>
            </div>
        `;

        watchlistMoviesContainer.appendChild(movieCard);

        const removeButton = movieCard.querySelector(".remove-btn");
        if (removeButton) {
            removeButton.addEventListener("click", () => removeFromWatchlist(movie.id));
        }
    });
};

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