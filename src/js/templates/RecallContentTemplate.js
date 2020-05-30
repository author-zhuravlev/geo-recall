export default (data) => {
    return data.map(item => {
        if (item.name && item.place && item.date && item.impression) {
            return `
                <li class="recall-item">
                    <p>
                        <b>${item.name}</b> ${item.place} ${item.date}        
                    </p>
                    <p>${item.impression}</p>
                </li>
            `;
        } else {
            return 'Отзывов пока нет...'
        }
    }).join('');
} 
