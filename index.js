document.addEventListener('DOMContentLoaded', function() {
    // Fetch the movie details for the first movie and populate the page
    fetchMovieDetails();
  
    // Fetch all the movies and populate menu
    fetchAllMovies();
  
    // Event listener for the "Buy Ticket" button
    document.addEventListener('click', function(event) {
        if (event.target && event.target.matches('.buy-ticket')) {
            const filmId = event.target.dataset.filmId;
            buyTicket(filmId);
        }
    });
  
    // Event listener for the "Delete" button
    document.addEventListener('click', function(event) {
        if (event.target && event.target.matches('.delete')) {
            const filmId = event.target.dataset.filmId;
            deleteFilm(filmId);
        }
    });
  
    // Function fetching movie details and populating the page
    function fetchMovieDetails() {
        getComputedStyle
        fetch('/films/1')
            .then(response => response.json())
            .then(data => {
                const availableTickets = data.capacity - data.tickets_sold;
                const movieDetailsContainer = document.getElementById('movie-details');
                movieDetailsContainer.innerHTML = `
                    <img src="${data.poster}" alt="${data.title} Poster">
                    <h2>${data.title}</h2>
                    <p><strong>Description:</strong> ${data.description}</p>
                    <p><strong>Runtime:</strong> ${data.runtime} minutes</p>
                    <p><strong>Showtime:</strong> ${data.showtime}</p>
                    <p><strong>Available Tickets:</strong> ${availableTickets}</p>
                `;
            })
            .catch(error => console.error('Error fetching movie details:', error));
    }
  
    // Function fetching all movies and populating the menu
    function fetchAllMovies() {
        fetch('/films')
            .then(response => response.json())
            .then(data => {
                const filmsMenu = document.getElementById('films');
                filmsMenu.innerHTML = '';
                data.forEach(movie => {
                    const listItem = document.createElement('li');
                    listItem.classList.add('film-item');
                    listItem.textContent = movie.title;
                    if (movie.tickets_sold >= movie.capacity) {
                        listItem.classList.add('sold-out');
                    } else {
                        const buyButton = document.createElement('button');
                        buyButton.textContent = 'Buy Ticket';
                        buyButton.classList.add('buy-ticket');
                        buyButton.dataset.filmId = movie.id;
                        listItem.appendChild(buyButton);
                    }
                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('delete');
                    deleteButton.dataset.filmId = movie.id;
                    listItem.appendChild(deleteButton);
                    filmsMenu.appendChild(listItem);
                });
            })
            .catch(error => console.error('Error fetching all movies:', error));
    }
  
    // Function that handles buying a ticket
    function buyTicket(filmId) {
        fetch(`/films/${filmId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tickets_sold: 1 })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to buy ticket');
            }
            return response.json();
        })
        .then(data => {
            fetchAllMovies(); // Refresh movie menu after ticket purchase
            fetchMovieDetails(); // Refresh movie details after ticket purchase
        })
        .catch(error => console.error('Error buying ticket:', error));
    }
  
    // Function that handles deleting a film
    function deleteFilm(filmId) {
        fetch(`/films/${filmId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete film');
            }
            return response.json();
        })
        .then(data => {
            fetchAllMovies(); // Refresh movie menu after film deletion
            // Optionally, remove movie details from the page if it matches the deleted film
            const currentFilmId = document.getElementById('movie-details').querySelector('img').dataset.filmId;
            if (currentFilmId === filmId) {
                document.getElementById('movie-details').innerHTML = '';
            }
        })
        .catch(error => console.error('Error deleting film:', error));
    }
});
