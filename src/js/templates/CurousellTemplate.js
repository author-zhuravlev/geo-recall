export default (data) => {
    return `
        <div class="carousell">
            <div class="carousel-header">
                <h3 class="place">${data.place}</h3>
                <a href="#" class="carousel-link">${data.adress}</a>
                <p class="impression">${data.impression}</p>
            </div>
            <div class="date">${data.date}</div>
        </div>
    `;
} 