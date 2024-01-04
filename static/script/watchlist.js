var wlbody = document.getElementById('wlbody');
const filterInput = document.getElementById('filterInput');
const table = document.getElementById('wltable');
const rows = table.getElementsByTagName('tr');
var cancelButton = document.getElementById('cancelButton');
var confirmButton = document.getElementById('confirmButton');
var watchlistButton = document.getElementById('watchlistButton');
var accountButton = document.getElementById('accountButton');
var logoutOverlay = document.getElementById('logoutOverlay');
var logoutCancelBtn = document.getElementById('logoutCancelBtn');
var logoutConfirmBtn = document.getElementById('logoutConfirmBtn');
var deleteCancelButton = document.getElementById('deleteCancelButton');
var saveAlert = document.getElementById('saveAlert');
var renameMsg = document.getElementById('renameMsg');
var saveIcon = document.getElementById('saveIcon');
var iconElement = document.createElement('i');
var renameCloseButton = document.getElementById('renameCloseButton');
var renameForm = document.getElementById('renameForm');

renameCloseButton.addEventListener('click', function() {
  renameOverlay.style.display = 'none';
});

cancelButton.addEventListener('click', function(){
  renameOverlay.style.display = 'none';
});

watchlistButton.style.borderBottom = "3px solid #12a5e4";

accountButton.addEventListener('click', function(){
  if(accountButton.innerText = 'Logout'){
    logoutOverlay.style.display = 'flex';
    logoutConfirmBtn.addEventListener('click', function(){
        window.location.href = "/logout";
    })
    logoutCancelBtn.addEventListener('click', function(){
        logoutOverlay.style.display = 'none';
    })
  }
});

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

fetch('/get_watchlist')
.then(response => response.json())
.then(data => {
    size = data.length;
    for(var i = 0; i < size; i++){
        var row = document.createElement('tr');

        var number = document.createElement("td"); //no.
        number.textContent = i + 1;
        row.appendChild(number);

        var name = document.createElement("td"); //name
        name.textContent = data[i].Name;
        name.id = i;
        row.appendChild(name);

        var date = document.createElement("td"); //date
        date.textContent = data[i].Date;
        row.appendChild(date);

        var time = document.createElement("td"); //time
        time.textContent = data[i].Time;
        row.appendChild(time);

        var edtbtn = document.createElement('button'); //editBtn
        edtbtn.id = 'edtButton';
        edtbtn.value = data[i].Name;
        edtbtn.onclick = function(){ rename(this.value) };
        var edticon = document.createElement('i');
        edticon.className = "bi bi-pencil-square";
        edtbtn.appendChild(edticon);

        var wthbtn = document.createElement('button'); //viewBtn
        wthbtn.id = 'wthButton';
        wthbtn.value = data[i].Name;
        wthbtn.onclick = function(){ viewScrn(this.value) };
        var eyeicon = document.createElement('i');
        eyeicon.className = "bi bi-eye";
        wthbtn.appendChild(eyeicon);

        var dltbtn = document.createElement('button'); //deleteBtn
        dltbtn.id = 'dltButton';
        dltbtn.value = data[i].Name;
        dltbtn.onclick = function(){ popup(this.value) };
        var dlticon = document.createElement('i');
        dlticon.className = "bi bi-trash3";
        dltbtn.appendChild(dlticon);

        var dltcell = document.createElement("td"); //deleteCell
        dltcell.id = 'dltCell';
        dltcell.appendChild(wthbtn);
        dltcell.appendChild(edtbtn);
        dltcell.appendChild(dltbtn);
        row.appendChild(dltcell);

        wlbody.appendChild(row);
    }
});

function popup(value){
  deleteOverlay.style.display = "flex";

  var identifier = value;

  confirmButton.addEventListener('click', function(){
    fetch('/delete_watchlist', {
      method: 'POST',
      body: JSON.stringify({watchlist_name: identifier}),
      headers: {
          'Content-Type': 'application/json',
        },
  })
  .then(response => response.json())
  .then(response => {
    console.log(response);
  })
  .catch(error => {
    console.error('Error deleting data:', error);
  });
  
  deleteOverlay.style.display = "none";

  location.reload();
});

deleteCancelButton.addEventListener('click', function(){
  deleteOverlay.style.display = 'none';
  identifier = "";
});

}

function rename(value){
  renameOverlay.style.display = 'flex';

  renameForm.addEventListener('submit', function(e){
    e.preventDefault();

    var newWatchlist = document.getElementById('renameInput').value;
    
    fetch('/get_watchlist_name')
    .then(response => response.json())
    .then(data => {
      if(data.includes(newWatchlist)){
        iconElement.className = 'bi bi-exclamation-circle-fill';
        saveIcon.appendChild(iconElement);
        saveAlert.innerText = ' Watchlist already exists';
        renameMsg.style.color = 'rgb(255, 37, 37)';
        renameMsg.style.display = 'flex';
      }
      else{
    fetch('/rename_watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({old_watchlist: value, new_watchlist: newWatchlist})
    })
    .then(response => response.json())
    .then(data => console.log(data));

    window.location.href = "/watchlist";
    }
  });

});

}

function viewScrn(value){
  fetch('/screen', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({scrnName: value})
  })
  .then(response => response.json())
  .then(data => console.log(data));
  
  window.location.href = "/view";
}

async function getUsername() { //duplicate in header.js
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
  }
});

// Add event listener to the filter input
filterInput.addEventListener('keyup', filterTable);

// Function to filter the table based on the input value
function filterTable() {
    const filterValue = filterInput.value.toLowerCase();
    var visiblecount = 1;
           
    // Loop through all table rows, hide those that don't match the filter value
    for (let i = 0; i < rows.length; i++) {
        const td = rows[i].getElementsByTagName('td');
        let rowVisible = false;
             
        for (let j = 0; j < td.length; j++) {
            if(j == 1 || j == 2 || j == 3){
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
