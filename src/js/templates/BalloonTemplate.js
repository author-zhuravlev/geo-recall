import recallContent from './RecallContentTemplate.js';
import icon from '../../img/mapmarker.png';

export default (data) => {
    return `
        <div class="recall">
            <div class="header">
                <div class="adress">
                    <img src="${icon}" alt="icon">
                    <span class="adress">${data.adress || data[0].adress ? data.adress  || data[0].adress : 'Адрес'}</span>
                </div>
                <button class="btn-close">&times</button>
            </div>

            <div class="wrapp">
                <ul class="recall-content">
                    ${Array.isArray(data)? recallContent(data): recallContent([data])}
                </ul>

                <div class="your-recall">
                    <h3>ВАШ ОТЗЫВ</h3>
                    <input type="text" name="name" id="name" placeholder="Ваше имя">
                    <input type="text" name="place" id="place" placeholder="Укажите место">
                    <textarea name="impression" id="impression" placeholder="Поделитесь впечатлениями"></textarea>
                </div>

                <button class="btn-add-recall">
                    Добавить
                </button>
            </div>
        </div>
    `;
}
