async function getScreen() {
    const response = await fetch('/get_screen', {redirect: 'follow'});
    const data = await response.json();
    return data;
}

async function getScreenName() {
    const response = await fetch('/get_screen_name', {redirect: 'follow'});
    const data = await response.json();
    return data;
}

getScreenName().then(data => {
    var watchlistName = document.getElementById('watchlistName');
    watchlistName.innerText = data.screen;
})

getScreen().then(data => {
    size = data.length;

    for(var i = 0; i < size; i++){
        var row = document.createElement('tr');

        var number = document.createElement("td"); //no.
        number.textContent = i + 1;
        row.appendChild(number);

        var stock = document.createElement("td"); //Stock
        var stockContainer = document.createElement("div");
        var stockLogo = document.createElement('div');
        var stockImage = document.createElement('img');
        var stockWrapper = document.createElement("div");
        var stockTicker = document.createElement("span");
        var stockName = document.createElement("span");
        stockContainer.className = 'stockContainer';
        stockLogo.className = 'stockLogo';
        stockWrapper.className = 'stockWrapper';
        stockTicker.className = 'stockTicker';
        stockName.className = 'stockName';
        var imageUrl = "https://raw.githubusercontent.com/Edward-Ang/StockLogos/main/" +  data[i].Stock + ".svg";
        stockImage.src = imageUrl;
        stockTicker.textContent = data[i].Stock;
        stockName.textContent = data[i].Name

        stockContainer.appendChild(stockLogo);
        stockContainer.appendChild(stockWrapper);
        stockLogo.appendChild(stockImage);
        stockWrapper.appendChild(stockTicker);
        stockWrapper.appendChild(stockName);
        stock.appendChild(stockContainer);

        stock.className = 'stockCol';
        stock.id = i;
        row.appendChild(stock);

        var open = document.createElement("td"); //Open
        open.textContent = data[i].Open;
        row.appendChild(open);

        var high = document.createElement("td"); //High
        high.textContent = data[i].High;
        row.appendChild(high);

        var low = document.createElement("td"); //Low
        low.textContent = data[i].Low;
        row.appendChild(low);

        var close = document.createElement("td"); //Close
        close.textContent = data[i].Close;
        row.appendChild(close);

        var ma = document.createElement("td"); //MA
        ma.textContent = data[i].MA;
        row.appendChild(ma);

        var ema = document.createElement("td"); //EMA
        ema.textContent = data[i].EMA;
        row.appendChild(ema);

        var rsi = document.createElement("td"); //RSI
        rsi.textContent = data[i].RSI;
        row.appendChild(rsi);

        var rating = document.createElement("td"); //Rating
        rating.textContent = data[i].Rating;
        var rate = data[i].Rating;
        if(rate == 'Strong Buy'){
            rating.className = 'sb';
        }
        if(rate == 'Buy'){
            rating.className = 'b';
        }
        if(rate == 'Neutral'){
            rating.className = 'n';
        }
        if(rate == 'Sell'){
            rating.className = 's';
        }
        if(rate == 'Strong Sell'){
            rating.className = 'ss';
        }
        row.appendChild(rating);

        tableBody.appendChild(row)
    }
})

filterScreenInput.addEventListener('keyup', filterScreenTable);

// Function to filter the table based on the input value
function filterScreenTable() {
    const filterValue = filterScreenInput.value.toLowerCase();
    var visiblecount = 1;
           
    // Loop through all table rows, hide those that don't match the filter value
    for (let i = 0; i < rows.length; i++) {
        const td = rows[i].getElementsByTagName('td');
        let rowVisible = false;
             
        for (let j = 0; j < td.length; j++) {
            if(j == 1 || j == 9){
                const cell = td[j];
                if (cell) {
                    if (cell.innerHTML.toLowerCase().indexOf(filterValue) > -1) {
                        rowVisible = true;
                        //make the first column show number based on visible column
                        td[0].textContent = visiblecount;
                        visiblecount++;
                        break;
                    }
                }
            }
        }
        if(i != 0){
            rows[i].style.display = rowVisible ? '' : 'none';
        }
    }
    console.log(visiblecount);
}