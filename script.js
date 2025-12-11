document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://localhost:3000/games';
    
    const gamesContainer = document.querySelector('.game-list'); 

    async function loadGames() {
        if (!gamesContainer) return;

        gamesContainer.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const response = await fetch(API_URL);
            const games = await response.json();

            gamesContainer.innerHTML = '';

            if (games.length === 0) {
                gamesContainer.innerHTML = `
                    <div class="empty-state">
                        <h3>Nenhum jogo encontrado.</h3>
                        <p>Seja o primeiro a adicionar um review!</p>
                    </div>
                `;
                return;
            }

            renderGames(games);
            applyStarRating();

        } catch (error) {
            console.error('Erro ao buscar jogos:', error);
            gamesContainer.innerHTML = '<p style="text-align:center; color:red">Erro ao carregar jogos. Verifique o servidor.</p>';
            showToast('Erro ao conectar com o servidor', 'error');
        }
    }

    function renderGames(games) {
        gamesContainer.innerHTML = '';

        games.forEach(game => {
            const gameCard = document.createElement('article');
            gameCard.classList.add('game-card');

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.innerHTML = `
                <svg viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
            `;
            
            deleteBtn.onclick = (e) => {
                e.preventDefault(); 
                deleteGame(game.id);
            };

            const cardContentHTML = `
                <a href="game.html?id=${game.id}" class="card-link">
                    <img src="${game.urlImage}" alt="Capa do Jogo ${game.gameName}">
                    <div class="card-content">
                        <h4>${game.gameName}</h4>
                    </div>
                </a>
                <div class="card-content">
                    <p>${game.review || 'Sem descrição.'}</p>
                    <div class="rating" data-score="${game.rating}"></div>
                </div>
            `;
            
            gameCard.innerHTML = cardContentHTML;
            gameCard.appendChild(deleteBtn);
            gamesContainer.appendChild(gameCard);
        });
    }

    const addGameForm = document.getElementById('add-game-form');
    if (addGameForm) {
        addGameForm.addEventListener('submit', async (e) => {
            e.preventDefault();


            const titleInput = document.getElementById('title').value;
            const imageInput = document.getElementById('image').value;
            const scoreInput = document.getElementById('score').value;
            const summaryInput = document.getElementById('summary').value;


            const newGame = {
                gameName: titleInput,      
                urlImage: imageInput,      
                rating: parseFloat(scoreInput), 
                review: summaryInput        
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newGame)
                });

                if (response.ok) {
                    showToast('Jogo cadastrado! Redirecionando...', 'success');
                    setTimeout(() => {window.location.href = 'index.html';}, 1500);
                } else {
                    const errorText = await response.text();
                    alert('Erro ao salvar: ' + errorText);
                    console.log('Erro do servidor:', errorText);
                }
            } catch (error) {
                console.error('Erro na conexão:', error);
                alert('Erro de conexão com o Backend.');
            }
        });
    }

    async function deleteGame(id) {
        if (!confirm("Tem certeza que deseja excluir este jogo?")) return;

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {

                showToast("Jogo excluído com sucesso!", "success");
                loadGames();
            } else {
                showToast("Erro ao excluir o jogo.", "error");
            }
        } catch (error) {
            showToast("Erro de conexão.", "error");
        }
    }


    function applyStarRating() {
        const ratingDivs = document.querySelectorAll('.rating');
        ratingDivs.forEach(div => {
            const score = parseFloat(div.dataset.score);
            const scoreOutOf5 = Math.round((score / 2) * 2) / 2;
            const fullStars = Math.floor(scoreOutOf5);
            const hasHalfStar = (scoreOutOf5 % 1 !== 0);

            let starsHTML = '';
            for (let i = 0; i < fullStars; i++) starsHTML += '<span class="star full">★</span>';
            if (hasHalfStar) starsHTML += '<span class="star half">★</span>';
            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
            for (let i = 0; i < emptyStars; i++) starsHTML += '<span class="star empty">☆</span>';
            
            div.innerHTML = starsHTML;
            div.innerHTML += ` <span class="score-number">(${score})</span>`;
        });
    }


    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const gameCards = document.querySelectorAll('.game-card');
            gameCards.forEach(card => {
                const title = card.querySelector('h4').textContent.toLowerCase();
                card.style.display = title.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }

    function highlightCurrentPage() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('header nav a').forEach(link => {
            const linkPath = link.getAttribute('href');
            if (currentPath.includes(linkPath) && linkPath !== '#') link.classList.add('active');
        });
    }

    

    async function loadGameDetails() {

        if (!window.location.pathname.includes('game.html')) return;


        const params = new URLSearchParams(window.location.search);
        const gameId = params.get('id');

        if (!gameId) return;

        try {

            const response = await fetch(`${API_URL}/${gameId}`);
            if (!response.ok) throw new Error("Jogo não encontrado");

            const game = await response.json();


            document.getElementById('game-title').innerText = game.gameName;
            document.getElementById('game-description').innerText = game.review;
            
 
            const heroBg = document.getElementById('hero-bg');
            if (heroBg) heroBg.style.backgroundImage = `url('${game.urlImage}')`;


            const ratingDiv = document.getElementById('game-rating');
            if (ratingDiv) {
                ratingDiv.setAttribute('data-score', game.rating);
                applyStarRating();
            }

        } catch (error) {
            console.error(error);
            document.getElementById('game-title').innerText = "Jogo não encontrado.";
        }
    }


    
    


    function showToast(message, type = 'success') {

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;


        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);


        setTimeout(() => {
            toast.classList.remove('show');

            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    async function deleteGame(id) {

        const confirmed = await showCustomConfirm();

        if (!confirmed) return; 


        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showToast("Jogo excluído com sucesso!", "success");
                loadGames();
            } else {
                showToast("Erro ao excluir o jogo.", "error");
            }
        } catch (error) {
            showToast("Erro de conexão.", "error");
        }
    }

    function showCustomConfirm() {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            const btnConfirm = document.getElementById('modal-confirm');
            const btnCancel = document.getElementById('modal-cancel');


            modal.classList.add('show');

            const closeAndResolve = (value) => {
                modal.classList.remove('show');
                btnConfirm.replaceWith(btnConfirm.cloneNode(true));
                btnCancel.replaceWith(btnCancel.cloneNode(true));
                resolve(value);
            };

            btnConfirm.onclick = () => closeAndResolve(true);
            btnCancel.onclick = () => closeAndResolve(false);
            
            modal.onclick = (e) => {
                if (e.target === modal) closeAndResolve(false);
            }
        });
    }

    async function loadReviewsPage() {
        if (!window.location.pathname.includes('reviews.html')) return;

        const container = document.getElementById('reviews-container');
        
        try {
            const response = await fetch(API_URL);
            const games = await response.json();

            container.innerHTML = '';

            if (games.length === 0) {
                container.innerHTML = '<div class="empty-state"><h3>Ainda sem reviews...</h3></div>';
                return;
            }

            games.forEach(game => {
                const card = document.createElement('article');
                card.className = 'review-card-wide';

                card.innerHTML = `
                    <img src="${game.urlImage}" alt="${game.gameName}">
                    <div class="review-content">
                        <h3>${game.gameName}</h3>
                        <p>${game.review || 'Sem análise disponível.'}</p>
                        
                        <div class="review-meta">
                            <div class="rating" data-score="${game.rating}"></div>
                            <a href="game.html?id=${game.id}" class="read-more">Ler Análise Completa →</a>
                        </div>
                    </div>
                `;
                
                container.appendChild(card);
            });

            applyStarRating();

        } catch (error) {
            console.error(error);
            container.innerHTML = '<p>Erro ao carregar reviews.</p>';
        }
    }

    async function loadFeaturedGame() {
        const featuredSection = document.getElementById('featured-section');
        if (!featuredSection) return;

        try {
            const response = await fetch(API_URL);
            const games = await response.json();

            if (games.length === 0) {
                featuredSection.style.display = 'none';
                return;
            }

            const latestGame = games[games.length - 1];

            document.getElementById('featured-title').innerText = latestGame.gameName;
            
            const shortDesc = latestGame.review.length > 150 
                ? latestGame.review.substring(0, 150) + '...' 
                : latestGame.review;
            document.getElementById('featured-desc').innerText = shortDesc;

            const btn = document.getElementById('featured-btn');
            btn.href = `game.html?id=${latestGame.id}`;
            btn.innerText = 'Ver Análise Completa';

            featuredSection.style.backgroundImage = `
                linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.3)), 
                url('${latestGame.urlImage}')
            `;

        } catch (error) {
            console.error("Erro ao carregar destaque:", error);
        }
    }

    loadGames();
    highlightCurrentPage();
    setTimeout(() => document.body.classList.add('loaded'), 10);
    loadGameDetails();
    loadReviewsPage();
    loadFeaturedGame();
});

