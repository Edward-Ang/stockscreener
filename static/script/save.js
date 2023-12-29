var saveButton = document.getElementById('saveButton')
var overlay = document.getElementById('overlay');
var saveOverlay = document.getElementById('saveOverlay');
var saveCloseButton = document.getElementById('saveCloseButton');
var cancelButton = document.getElementById('cancelButton');
var filterCloseButton = document.getElementById('filterCloseButton');
var saveForm = document.getElementById('saveForm');
var saveAlert = document.getElementById('saveAlert');
var saveMsg = document.getElementById('saveMsg');
var saveIcon = document.getElementById('saveIcon');
var iconElement = document.createElement('i');

saveButton.addEventListener('click', function() {
  fetch('/get_session',{redirect: 'follow'})
    .then(response => response.json())
    .then(data => {
      if(data.username == null){
        console.log(data.username)
        window.location.href = '/login';
      }
      else{
        saveOverlay.style.display = 'flex';
      }
  });
});

filterCloseButton.addEventListener('click', function() {
  overlay.style.display = 'none';
});

saveCloseButton.addEventListener('click', function() {
  saveForm.reset();
  saveOverlay.style.display = 'none';
  saveAlert.innerText = "";
  iconElement.className = "";
});

cancelButton.addEventListener('click', function(){
  saveForm.reset();
  saveOverlay.style.display = 'none';
  saveAlert.innerText = "";
  iconElement.className = "";
})

saveForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const watchlistName = document.getElementById('saveInput').value;

  // Get existing collections
  fetch('/get_watchlist_name')
  .then(response => response.json())
  .then(data => {
    // Process the data here
    console.log(data);
    if(data.includes(watchlistName)){
      iconElement.className = 'bi bi-exclamation-circle-fill';
      saveIcon.appendChild(iconElement);
      saveAlert.innerText = ' Watchlist already exists';
      saveMsg.style.color = 'rgb(255, 37, 37)';
      saveMsg.style.display = 'flex';
    }
    else{
  // Insert data into the collection
  var date = new Date();
  var year = date.getFullYear();
  var month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-based
  var day = ("0" + date.getDate()).slice(-2);
  var currDate = day + "/" + month + "/" + year;

  var hours = ("0" + date.getHours()).slice(-2);
  var minutes = ("0" + date.getMinutes()).slice(-2);
  var currTime = hours + ":" + minutes;

  var tableData = [];
  var table = document.getElementById('myTable');
  var rows = table.getElementsByTagName('tr');

  for(var i = 1; i < rows.length; i++){
    if(rows[i].offsetParent !== null){ //check if rows are visible
      var cells = rows[i].getElementsByTagName('td');
      var rowData = {};

      for(var j = 0; j < cells.length; j++){
        if(j == 2){
          var field = table.rows[i].cells[j];
          var stockTicker = field.querySelector('.stockTicker');
          rowData['Stock'] = stockTicker.innerHTML;

          var stockName = field.querySelector('.stockName');
          rowData["Name"] = stockName.innerHTML;
        }
        else{
          var field = table.rows[0].cells[j].innerText;
          rowData[field] = cells[j].innerText;
        }
      }

      tableData.push(rowData);
    }
  }

  fetch('/insert_data', {
    method: 'POST',
    body: JSON.stringify({ 
      watchlist_name: watchlistName, 
      date: currDate,
      time: currTime,
      table_data: tableData
    }), // Include collection_name and data
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => response.json())
  .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.error('Error inserting data:', error);
  });
  iconElement.className = 'bi bi-check-circle-fill';
  saveIcon.appendChild(iconElement);
  saveAlert.innerText = "Saved"
  saveMsg.style.color = 'green'
  saveMsg.style.display = 'flex'
  }
  });

});

