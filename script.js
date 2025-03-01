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
// const fetchMovies = async (query) => {
//     console.log("Fetching movies for query:", query);
//     const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`;
//     try {
//         const response = await fetch(url);
//         const data = await response.json();
//         displayMovies(data.results);
//     } catch (error) {
//         console.error("Error fetching movies:", error);
//     }
// };
const fetchMovies = async (query) => {
    console.log("Fetching movies for query:", query);
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        let movies = data.results;

        // Prioritize movies that match the exact phrase
        movies.sort((a, b) => {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();
            const queryLower = query.toLowerCase();

            const exactMatchA = titleA === queryLower;
            const exactMatchB = titleB === queryLower;

            if (exactMatchA && !exactMatchB) return -1;
            if (!exactMatchA && exactMatchB) return 1;

            const startsWithA = titleA.startsWith(queryLower);
            const startsWithB = titleB.startsWith(queryLower);

            if (startsWithA && !startsWithB) return -1;
            if (!startsWithA && startsWithB) return 1;

            return 0;
        });

        // Fetch additional details for each movie
        const movieDetailsPromises = movies.map(movie => fetchMovieDetails(movie));
        const detailedMovies = await Promise.all(movieDetailsPromises);

        // Display refined search results with extra details
        displayMovies(detailedMovies);
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
};
    //Create fetchMovieDetails() to Get Director & Actors
    const fetchMovieDetails = async (movie) => {
        const url = `${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&append_to_response=credits`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();

            // Extract director and top 3 actors
            const director = data.credits.crew.find(person => person.job === "Director")?.name || "Unknown Director";
            const topActors = data.credits.cast.slice(0, 3).map(actor => actor.name).join(", ") || "No Actors Listed";

            return {
                id: movie.id,
                title: movie.title,
                releaseDate: movie.release_date ? movie.release_date.split("-")[0] : "N/A",
                rating: movie.vote_average ? movie.vote_average.toFixed(1) : "N/A",
                poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "https://via.placeholder.com/500x750?text=No+Image",
                overview: movie.overview || "No description available.",
                director: director,
                actors: topActors
            };
        } catch (error) {
            console.error("Error fetching movie details:", error);
            return movie; // Return basic movie info if details fail
        }
    };
// Function to display search results
// const displayMovies = (movies) => {
//     moviesContainer.innerHTML = "";
//     if (!movies || movies.length === 0) {
//         moviesContainer.innerHTML = "<p class='text-center'>No movies found.</p>";
//         return;
//     }
//     movies.forEach(movie => {
//         moviesContainer.appendChild(createMovieCard(movie, true));
//     });
// };
const displayMovies = (movies) => {
    moviesContainer.innerHTML = "";
    if (!movies || movies.length === 0) {
        moviesContainer.innerHTML = "<p class='text-center'>No movies found.</p>";
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("col-md-4", "mb-4");
        movieCard.innerHTML = `
            <div class="card">
                <img src="${movie.poster_path}" class="card-img-top" alt="${movie.title}">
                <div class="card-body">
                    <h5 class="card-title">${movie.title} (${movie.releaseDate})</h5>
                    <p class="card-text"><strong>Director:</strong> ${movie.director}</p>
                    <p class="card-text"><strong>Top Cast:</strong> ${movie.actors}</p>
                    <p class="card-text">${movie.overview}</p>
                    <p class="card-text"><strong>Rating:</strong> ${movie.rating}</p>
                    <button class="btn btn-warning watchlist-btn">+ Watchlist</button>
                </div>
            </div>
        `;

        // Add event listener for "+ Watchlist" button
        const button = movieCard.querySelector(".watchlist-btn");
        button.addEventListener("click", () => {
            addToWatchlist(movie.id, movie.title, movie.poster_path, movie.rating);
        });

        moviesContainer.appendChild(movieCard);
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