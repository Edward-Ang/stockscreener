var filterButton = document.getElementById('filterButton');
var filterCloseButton = document.getElementById('filterCloseButton');
var ratingOption = document.getElementById('ratingOpt');
var clearButton = document.getElementById('clearButton');
var openSlider = document.querySelector("#kt_slider_basic_open");
var highSlider = document.querySelector("#kt_slider_basic_high");
var lowSlider = document.querySelector("#kt_slider_basic_low");
var closeSlider = document.querySelector("#kt_slider_basic_close");
var MASlider = document.querySelector("#kt_slider_basic_MA");
var EMASlider = document.querySelector("#kt_slider_basic_EMA");
var RSISlider = document.querySelector("#kt_slider_basic_RSI");

noUiSlider.create(openSlider, {
    start: [1, 555],
    connect: true,
    step: 2.11,
    range: {
        "min": 0,
        "max": 555
    }
});

noUiSlider.create(highSlider, {
    start: [1, 599],
    connect: true,
    step: 2,
    range: {
        "min": 0,
        "max": 600
    }
});

noUiSlider.create(lowSlider, {
    start: [1, 599],
    connect: true,
    step: 2,
    range: {
        "min": 0,
        "max": 600
    }
});

noUiSlider.create(closeSlider, {
    start: [1, 599],
    connect: true,
    step: 2,
    range: {
        "min": 0,
        "max": 600
    }
});

noUiSlider.create(MASlider, {
    start: [1, 599],
    connect: true,
    step: 2,
    range: {
        "min": 0,
        "max": 600
    }
});

noUiSlider.create(EMASlider, {
    start: [1, 599],
    connect: true,
    step: 2,
    range: {
        "min": 0,
        "max": 600
    }
});

noUiSlider.create(RSISlider, {
    start: [1, 599],
    connect: true,
    step: 2,
    range: {
        "min": 0,
        "max": 600
    }
});

// Assuming this function gets called when the NouiSlider values change
function updateFilters() {
    const inputValue = filterInput.value.toLowerCase();

    const ratingValue = ratingOption.value.toLowerCase();

    const openSliderValues = openSlider.noUiSlider.get();// get the values from NouiSlider
    const minOpen = openSliderValues[0];
    const maxOpen = openSliderValues[1];

    const highSliderValues = highSlider.noUiSlider.get();// get the values from NouiSlider
    const minHigh = highSliderValues[0];
    const maxHigh = highSliderValues[1];

    const lowSliderValues = lowSlider.noUiSlider.get();// get the values from NouiSlider
    const minLow = lowSliderValues[0];
    const maxLow = lowSliderValues[1];

    const closeSliderValues = closeSlider.noUiSlider.get();// get the values from NouiSlider
    const minClose = closeSliderValues[0];
    const maxClose = closeSliderValues[1];

    const MASliderValues = MASlider.noUiSlider.get();// get the values from NouiSlider
    const minMA = MASliderValues[0];
    const maxMA = MASliderValues[1];

    const EMASliderValues = EMASlider.noUiSlider.get();// get the values from NouiSlider
    const minEMA = EMASliderValues[0];
    const maxEMA = EMASliderValues[1];

    const RSISliderValues = RSISlider.noUiSlider.get();// get the values from NouiSlider
    const minRSI = RSISliderValues[0];
    const maxRSI = RSISliderValues[1];

    applyFilters(
        inputValue, ratingValue, minOpen, maxOpen, minHigh, maxHigh, minLow, maxLow,
        minClose, maxClose, minMA, maxMA, minEMA, maxEMA, minRSI, maxRSI
    );
}

ratingOption.addEventListener("change", function(){
    updateFilters();
})

openSlider.noUiSlider.on("update", function (values, handles) {
    updateFilters();
});

highSlider.noUiSlider.on("update", function (values, handles) {
    updateFilters();
});

lowSlider.noUiSlider.on("update", function (values, handles) {
    updateFilters();
});

closeSlider.noUiSlider.on("update", function (values, handles) {
    updateFilters();
});

MASlider.noUiSlider.on("update", function (values, handles) {
    updateFilters();
});

EMASlider.noUiSlider.on("update", function (values, handles) {
    updateFilters();
});

RSISlider.noUiSlider.on("update", function (values, handles) {
    updateFilters();
});

filterButton.addEventListener('click', function(){
    filterOverlay.style.display = 'flex';
});

filterCloseButton.addEventListener('click', function(){
    filterOverlay.style.display = 'none';
});

clearButton.addEventListener('click', function(){
    ratingOption.value = "All";
    openSlider.noUiSlider.reset();
    highSlider.noUiSlider.reset();
    lowSlider.noUiSlider.reset();
    closeSlider.noUiSlider.reset();
    MASlider.noUiSlider.reset();
    EMASlider.noUiSlider.reset();
    RSISlider.noUiSlider.reset();
});