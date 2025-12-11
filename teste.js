document.addEventListener('DOMContentLoaded', () => {

    const ratingDivs = document.querySelectorAll('.rating');
    highlightCurrentPage();
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 10);
    ratingDivs.forEach(div => {
        const score = parseFloat(div.dataset.score);

        const scoreOutOf5 = Math.round((score / 2) * 2) / 2;
        
        const fullStars = Math.floor(scoreOutOf5);
        const hasHalfStar = (scoreOutOf5 % 1 !== 0);

        let starsHTML = '';

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span class="star full">★</span>';
        }

        if (hasHalfStar) {
            starsHTML += '<span class="star half">★</span>';
        }

        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<span class="star empty">☆</span>';
        }
        
        div.innerHTML = starsHTML;

        div.innerHTML += ` <span class="score-number">(${score})</span>`;
        
    });



    const searchBar = document.getElementById('search-bar');
    const gameCards = document.querySelectorAll('.game-card');


    searchBar.addEventListener('input', (e) => {

        const searchTerm = e.target.value.toLowerCase();

        gameCards.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();

            if (title.includes(searchTerm)) {
                card.style.display = 'block'; 
            } else {
                card.style.display = 'none';
            }
        });
    });
    function highlightCurrentPage() {
        const currentPath = window.location.pathname;
        
        const navLinks = document.querySelectorAll('header nav a');

        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');

            if (currentPath.includes(linkPath) && linkPath !== '#') {
                link.classList.add('active');
            } 
            
            if (currentPath === '/' && link.textContent === 'Home') {
                link.classList.add('active');
            }
        });
    }
});