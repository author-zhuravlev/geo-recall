import '../css/recall.css';
import '../css/carousel.css';

import balloonHTML from './templates/BalloonTemplate.js';
import RecallContentTemplate from './templates/RecallContentTemplate.js';
import curousell from './templates/CurousellTemplate.js';

const options = {
    center: [48.573896, 39.307699],
    zoom: 13,
    controls: ['zoomControl'],
    container: 'map',
};

let myMap;
let cluster;

// Functions
const init = ({container, ...options }) => new ymaps.Map(container, options);

const getDataFromStorage = () => {
    return Object.values(localStorage).map(valStorage => JSON.parse(valStorage));
};

const getDate = () => {
    const when = new Date();

    const date = when.toLocaleDateString();
    const time = when.toLocaleTimeString();

    return `${date} ${time}`;
};

const createBalloonTemplate = () => {
    return ymaps.templateLayoutFactory.createClass(
        '$[[options.contentLayout]]',
        {
            build() {
                this.constructor.superclass.build.call(this);

                const recall = this.getParentElement().querySelector('.recall');
                const btnCloseRecall = recall.querySelector('.btn-close');
                const btnAddRecall = recall.querySelector('.btn-add-recall');

                btnCloseRecall.addEventListener('click', () => this.onCloseClick());
                btnAddRecall.addEventListener('click', addRecall);
            
            },

            onCloseClick() {
                this.events.fire('userclose');
            }
        }
    );
};

const createBalloonContent = (data) => {
    return ymaps.templateLayoutFactory.createClass(
        balloonHTML(data)
    );
};

const getAdrress = async (coords) => {
    const result = await ymaps.geocode(coords);
    const firstGeoObject = result.geoObjects.get(0);

    return firstGeoObject.getAddressLine();
};

const openBalloon = (dataClick) => {
    myMap.balloon.open(
        dataClick.coords,
        dataClick,
        {
            layout: createBalloonTemplate(),
            contentLayout: createBalloonContent(dataClick),
            closeButton: false
        }
    );
};

const showBalloon = (dataClick) => {
    if (!myMap.balloon.isOpen()) {
        openBalloon(dataClick);
    } else {
        myMap.balloon.close();
    }
};

const clickOnMap = async (e) => {
    const coords = e.get('coords');
    const adress = await getAdrress(coords);
    
    const dataClick = {
        coords,
        adress
    }

    showBalloon(dataClick);
};

const clearInpValue = (name, place, impression) => {
    name.value = '';
    place.value = '';
    impression.value = '';
};

const getValueFromInput = (wrapper) => {
    const name = wrapper.querySelector('#name');
    const place = wrapper.querySelector('#place');
    const impression = wrapper.querySelector('#impression');

    const inputValues = {
        name: name.value,
        place: place.value,
        impression: impression.value
    };

    clearInpValue(name, place, impression);

    return inputValues;
};

const checkInputs = ({ name, place, impression }) => !!(name && place && impression);

const updateRecallContent = (conteiner, adress) => {
    const recallString = localStorage.getItem(adress);
    const recallContent = RecallContentTemplate(JSON.parse(recallString));

    conteiner.innerHTML = recallContent;
};

const createPlacemark = (data) => {
    const myPlacemark = new ymaps.Placemark(
        data.coords,
        {
            data,
        },
        {
            balloonShadow: false,
            balloonLayout: createBalloonTemplate(),
            balloonContentLayout: createBalloonContent(data),
            balloonPanelMaxMapArea: 0,
            hideIconOnBalloonOpen: true,
            preset: 'islands#violetIcon'
        }
    );

    return myPlacemark;
};

const addNewDataToLocalStorage = (data) => {
    const key = data.adress;

    if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([data]));
    } else {
        let contentReviews = JSON.parse(localStorage.getItem(key));

        contentReviews.push(data);
        localStorage.setItem(key, JSON.stringify(contentReviews));
    }
};

const createClusterContent = () => {
    return ymaps.templateLayoutFactory.createClass(
        curousell({
            adress: '{{properties.data.adress}}',
            place: '{{properties.data.place}}',
            date: '{{properties.data.date}}',
            impression: '{{properties.data.impression}}'
        })
    );
};

const createCluster = () => {
    const cluster = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: createClusterContent(),
        clusterOpenBalloonOnClick: true,
        clusterDisableClickZoom: true,
        clusterHideIconOnBalloonOpen: false,
        geoObjectHideIconOnBalloonOpen: false
    });

    return cluster;
};

const addRecall = async (e) => {
    const dataClick = myMap.balloon.getData();

    const wrapper = e.currentTarget.parentNode;
    const conteinerForRecallContent = wrapper.querySelector('.recall-content');

    const inputValues = getValueFromInput(wrapper);

    if (checkInputs(inputValues)) {
        const date = getDate();
        // || dataClick.geometry._coordinates
        // await getAdrress(coords)

        console.log(dataClick);
        /////////////////////////////////////////////////////////////////////////////////////
        const data = {
            coords: dataClick.coords || dataClick[0].coords,
            name: inputValues.name,
            place: inputValues.place,
            impression: inputValues.impression,
            adress: dataClick.adress || dataClick[0].adress,
            date
        };
        ////////////////////////////////////////////////////////////////////////////////////////
        addNewDataToLocalStorage(data);

        const placemark = createPlacemark(data);

        cluster.add(placemark);

        myMap.geoObjects.add(cluster);

        updateRecallContent(conteinerForRecallContent, data.adress);
    }
};

const getPlacemark = (arr) => arr.map(obj => createPlacemark(obj));

const addDataFromStorage = () => {
    getDataFromStorage().forEach(arr => {
        cluster.add(getPlacemark(arr));
        myMap.geoObjects.add(cluster);
    });
};

const clickOnLink = () => {
    document.body.addEventListener('click', (e) => {
        if (e.target.matches('a.carousel-link')) {
            e.preventDefault();

            const data = JSON.parse(localStorage.getItem(e.target.textContent));
            openBalloon(data);
        }
    });
};

const createMap = (options) => {
    ymaps.ready(() => {
        myMap = init(options);

        myMap.events.add('click', clickOnMap);

        cluster = createCluster();

        addDataFromStorage();

        clickOnLink();
    });
};

// Call function 
createMap(options);
