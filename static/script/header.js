// Get the input element and table
const filterInput = document.getElementById('filterInput');
const table = document.getElementById('myTable');
const rows = table.getElementsByTagName('tr');
var watchlistButton = document.getElementById('watchlistButton');
var accountButton = document.getElementById('accountButton');
var logoutOverlay = document.getElementById('logoutOverlay');
var logoutCancelBtn = document.getElementById('logoutCancelBtn');
var logoutConfirmBtn = document.getElementById('logoutConfirmBtn');

var openValueMin = document.querySelector("#kt_slider_basic_min_open");
var openValueMax = document.querySelector("#kt_slider_basic_max_open");
var highValueMin = document.querySelector("#kt_slider_basic_min_high");
var highValueMax = document.querySelector("#kt_slider_basic_max_high");
var lowValueMin = document.querySelector("#kt_slider_basic_min_low");
var lowValueMax = document.querySelector("#kt_slider_basic_max_low");
var closeValueMin = document.querySelector("#kt_slider_basic_min_close");
var closeValueMax = document.querySelector("#kt_slider_basic_max_close");
var MAValueMin = document.querySelector("#kt_slider_basic_min_MA");
var MAValueMax = document.querySelector("#kt_slider_basic_max_MA");
var EMAValueMin = document.querySelector("#kt_slider_basic_min_EMA");
var EMAValueMax = document.querySelector("#kt_slider_basic_max_EMA");
var RSIValueMin = document.querySelector("#kt_slider_basic_min_RSI");
var RSIValueMax = document.querySelector("#kt_slider_basic_max_RSI");

function checkWindowSize() {
    var width = window.innerWidth;
    var saveButton = document.getElementById('saveButton');
    var filterButton = document.getElementById('filterButton');
    if (width <= 480) {
        var saveIcon = document.createElement('i');
        var filterIcon = document.createElement('i');
        saveIcon.className = 'bi bi-cloud-download';
        filterIcon.className = 'bi bi-sliders';
        saveButton.innerHTML = saveIcon.outerHTML;
        filterButton.innerHTML = filterIcon.outerHTML;
    } else {
        saveButton.textContent = 'Save';
        filterButton.textContent = 'Filter';
    }
}

checkWindowSize();

window.addEventListener('resize', checkWindowSize);

document.getElementById("dropdownButton").addEventListener("click", function() {
    var menu = document.getElementById("dropdownContent");
    var header = document.querySelector("header");
    if (menu.style.display === "none") {
        header.style.borderRadius = "8px 8px 0px 0px";
        menu.style.display = "inline-block";
    } else {
      menu.style.display = "none";
      header.style.borderRadius = "8px 8px 8px 8px";
    }
});  

async function getUsername() {
    const response = await fetch('/get_session', {redirect: 'follow'});
    const data = await response.json();
    return data.username;
}

getUsername().then(username => {
    if(username == null){
        watchlistButton.style.display = 'none';
        accountButton.addEventListener('click', function(){
            window.location.href = "/login";
        })
    }
    else{
        accountButton.innerText = 'Logout';
        accountButton.addEventListener('click', function(){
            logoutOverlay.style.display = 'flex';
            logoutConfirmBtn.addEventListener('click', function(){
                window.location.href = "/logout";
            })
            logoutCancelBtn.addEventListener('click', function(){
                logoutOverlay.style.display = 'none';
            })
        });
    }
});

// Add event listener to the filter input
filterInput.addEventListener('keyup', function(){
    updateFilters();
});

function applyFilters(inputValue, ratingValue, minOpen, maxOpen, minHigh, maxHigh, minLow, 
    maxLow, minClose, maxClose, minMA, maxMA, minEMA, maxEMA, minRSI, maxRSI
    ) {
    var visiblecount = 1;

    openValueMax.innerText = maxOpen;
    openValueMin.innerText = minOpen;
    highValueMax.innerText = maxHigh;
    highValueMin.innerText = minHigh;
    lowValueMax.innerText = maxLow;
    lowValueMin.innerText = minLow;
    closeValueMax.innerText = maxClose;
    closeValueMin.innerText = minClose;
    MAValueMax.innerText = maxMA;
    MAValueMin.innerText = minMA;
    EMAValueMax.innerText = maxEMA;
    EMAValueMin.innerText = minEMA;
    RSIValueMax.innerText = maxRSI;
    RSIValueMin.innerText = minRSI;

    for (let i = 0; i < rows.length; i++) {
        const td = rows[i].getElementsByTagName('td');
        let rowVisible = false;

        for (let j = 0; j < td.length; j++) {
            const searchText = td[2].textContent.toLowerCase();
            const filterMatch = (searchText.indexOf(inputValue) > -1);

            const openText = parseFloat(td[3].textContent.toLowerCase());
            const openMatch = (openText >= minOpen && openText <= maxOpen);

            const highText = parseFloat(td[4].textContent.toLowerCase());
            const highMatch = (highText >= minHigh && highText <= maxHigh);

            const lowText = parseFloat(td[5].textContent.toLowerCase());
            const lowMatch = (lowText >= minLow && lowText <= maxLow);

            const closeText = parseFloat(td[6].textContent.toLowerCase());
            const closeMatch = (closeText >= minClose && closeText <= maxClose);

            const MAText = parseFloat(td[7].textContent.toLowerCase());
            const MAMatch = (MAText >= minMA && MAText <= maxMA);

            const EMAText = parseFloat(td[8].textContent.toLowerCase());
            const EMAMatch = (EMAText >= minEMA && EMAText <= maxEMA);

            const RSIText = parseFloat(td[9].textContent.toLowerCase());
            const RSIMatch = (RSIText >= minRSI && RSIText <= maxRSI);

            const ratingText = td[10].textContent.toLowerCase();
            const ratingMatch = (ratingValue === "all" || ratingText === ratingValue);

            if (filterMatch && openMatch && highMatch && lowMatch && 
            closeMatch && MAMatch && EMAMatch && RSIMatch && ratingMatch) {
                rowVisible = true;
                td[1].textContent = visiblecount;
                visiblecount++;
                break;
            }     
        }
        if (i != 0) {
            rows[i].style.display = rowVisible ? '' : 'none';
        }
    }
}
