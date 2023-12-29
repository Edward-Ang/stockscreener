var spinnerBg = document.getElementById('spinnerBg');

function disableClick(event) {
    event.stopPropagation();
}

function sortTable(columnIndex) {

spinnerBg.style.display = 'flex';

setTimeout(function() {

var table, rows, switching, i, x, y, shouldSwitch, direction, switchcount = 0;
table = document.getElementById("wltable");
switching = true;
direction = "asc";

while (switching) {
switching = false;
rows = table.rows;

for (i = 1; i < (rows.length - 1); i++) {
  shouldSwitch = false;
  x = rows[i].getElementsByTagName("td")[columnIndex].innerText;
  y = rows[i + 1].getElementsByTagName("td")[columnIndex].innerText;

  if (direction === "asc") {
    if (columnIndex === 0) {
      shouldSwitch = alphanumericCompare(x, y) > 0;
    } else {
      shouldSwitch = compareValues(x, y) > 0;
    }
  } else if (direction === "desc") {
    if (columnIndex === 0) {
      shouldSwitch = alphanumericCompare(x, y) < 0;
    } else {
      shouldSwitch = compareValues(x, y) < 0;
    }
  }

  if (shouldSwitch) {
    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
    switching = true;
    switchcount++;
  }
}

if (switchcount === 0 && direction === "asc") {
  direction = "desc";
  switching = true;
}
}

//make the first column not sort
rows = table.rows;
var vc = 1;

for (let i = 1; i < rows.length; i++) {
  if (rows[i].style.display !== "none" && columnIndex !== 0) {
    rows[i].getElementsByTagName("td")[0].innerText = vc;
    vc++;
  }
}
spinnerBg.style.display = 'none';

}, 0);
}

function alphanumericCompare(a, b) {
return a.localeCompare(b, 'en', { numeric: true });
}

function compareValues(a, b, columnIndex) {
var parsedA = parseFloat(a);
var parsedB = parseFloat(b);

  if (!isNaN(parsedA) && !isNaN(parsedB)) {
    return parsedA - parsedB;
  }else {
    return a.localeCompare(b, 'en', { numeric: true });
  }
}