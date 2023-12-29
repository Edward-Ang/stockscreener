 var tableBody = document.getElementById("tableBody");
 var favBody = document.getElementById("favBody");

 async function getMain() {
    const response = await fetch('/get_main', {redirect: 'follow'});
    const data = await response.json();
    return data;
}

getMain().then(data => {
    size = data.length;

    // Create an object to store cached images
    const cachedImages = {};

    for(var i = 0; i < size; i++){
        var row = document.createElement('tr');

        var book = document.createElement("td"); //Book
        book.className = 'saveFav';
        if(data[i].Book == 0){
            var icon = document.createElement("i");
            icon.className = "bi bi-bookmark";
            var favSpan = document.createElement('span');
            favSpan.className = 'favSpan';
            favSpan.dataset.value = data[i].Stock;
            favSpan.onclick = function(){ toggleIcon(this.dataset.value) };
            favSpan.appendChild(icon);
            book.appendChild(favSpan);
        }
        else{
            var icon = document.createElement("i");
            icon.className = "bi bi-bookmark-fill";
            var favSpan = document.createElement('span');
            favSpan.className = 'favSpan';
            favSpan.dataset.value = data[i].Stock;
            favSpan.onclick = function(){ toggleIcon(this.dataset.value) };
            favSpan.appendChild(icon);
            book.appendChild(favSpan);
        }
        row.appendChild(book);

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

        // Check if the image is not already cached (**cache method**)
        if (!cachedImages[imageUrl]) {
            // Preload the image
            const img = new Image();
            img.src = imageUrl;

            // Store the image in the cache
            cachedImages[imageUrl] = img;
        }
        
        // Use the cached image
        stockImage.src = cachedImages[imageUrl].src;

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

        if(data[i].Book == 1){
            var row = document.createElement('tr');
    
            var stock = document.createElement("td"); //Stock
            stock.textContent = data[i].Stock;
            row.appendChild(stock);

            var rating = document.createElement("td"); //Rating
            var rate = data[i].Rating;
            if(rate == 'Strong Buy'){
                rating.className = 'sb';
                var icon = document.createElement("i");
                icon.className = 'fa-solid fa-angles-up';
                icon.style.fontSize = '20px';
                rating.appendChild(icon);
            }
            if(rate == 'Buy'){
                rating.className = 'b';
                var icon = document.createElement("i");
                icon.className = 'fa-solid fa-angle-up';
                icon.style.fontSize = '20px';
                rating.appendChild(icon);
            }
            if(rate == 'Neutral'){
                rating.className = 'n';
                var icon = document.createElement("i");
                icon.className = 'fa-solid fa-minus';
                icon.style.fontSize = '20px';
                rating.appendChild(icon);      
            }
            if(rate == 'Sell'){
                rating.className = 's';
                var icon = document.createElement("i");
                icon.className = 'fa-solid fa-angle-down';
                icon.style.fontSize = '20px';
                rating.appendChild(icon);   
            }
            if(rate == 'Strong Sell'){
                rating.className = 'ss';
                var icon = document.createElement("i");
                icon.className = 'fa-solid fa-angles-down';
                icon.style.fontSize = '20px';
                rating.appendChild(icon);   
            }
            row.appendChild(rating);

            favBody.appendChild(row);
        }
    }
});

function toggleIcon(status){
    fetch('/update_fav', {
        method: 'POST',
        body: JSON.stringify({ 
            ticker: status
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.error('Error updating data:', error);
      });
    window.location.href = '/home';
}