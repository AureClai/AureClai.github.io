// Make the DIV element draggable:
dragElement(document.getElementById("my-elem2"));
// Make the DIV element draggable:
dragElement(document.getElementById("my-elem"));
dragElement(document.getElementById("my-elem3"));
dragElement(document.getElementById("my-console"));

var mysvg = document.getElementById("my-svg");
var mysvg2 = document.getElementById("my-svg2");
var mypin = document.getElementById("my-pin");
var mypin2 = document.getElementById("my-pin2");
var mypin3 = document.getElementById("my-pin3");
var mypin4 = document.getElementById("my-pin4");
var myconsole = document.getElementById("my-console");
var consin = document.getElementById("cons-in");
var runButton = document.getElementById("button-run");

var numberOfTimes = 0;

runButton.onclick = displayDate;

const BEZIER_INCREASE = 200;

updatePaths();

function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  // otherwise, move the DIV from anywhere inside the DIV:
  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
    updatePaths();
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function offset(el) {
  var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}

function updatePaths() {
  // get the position of mypin1
  var pos_mypin1 = offset(mypin);
  var pos_mypin2 = offset(mypin2);
  updateSVG(
    mysvg,
    pos_mypin1.left + 4,
    pos_mypin2.left + 4,
    pos_mypin1.top + 4,
    pos_mypin2.top + 4
  );

  // get the position of mypin1
  pos_mypin1 = offset(mypin3);
  pos_mypin2 = offset(mypin4);
  updateSVG(
    mysvg2,
    pos_mypin1.left + 4,
    pos_mypin2.left + 4,
    pos_mypin1.top + 4,
    pos_mypin2.top + 4
  );
}

function updateSVG(elem, x1, x2, y1, y2) {
  var dx = x2 - x1;
  var absDy = Math.abs(y2 - y1);

  var absDx = Math.abs(dx);

  var dxBezier = Math.max(
    BEZIER_INCREASE * (-Math.exp(-absDy / 300) + 1),
    dx / 2
  );
  var top = Math.min(y1, y2);

  var width = absDx + Math.max(dxBezier * 2 - 2 * dx, 0);
  var height = Math.abs(y2 - y1);

  var y0 = Math.min(y1, y2);
  var x0 = Math.min(x1, x2 - dxBezier);

  var X1 = x1 - x0;
  var Y1 = y1 - y0;

  var X2 = x2 - x0;
  var Y2 = y2 - y0;

  // set the svg position
  elem.style.top = top + "px";
  elem.style.left = x0 + "px";

  var innersvg = elem.getElementsByTagName("svg")[0];
  innersvg.setAttribute("width", width + 10 + "px");
  innersvg.setAttribute("height", height + 10 + "px");

  // set the path
  var path = elem.getElementsByTagName("path")[0];
  path.setAttribute(
    "d",
    `M${X1} ${Y1} C ${X1 + dxBezier} ${Y1} ${X2 - dxBezier} ${Y2} ${X2} ${Y2}`
  );
}

function displayDate(e) {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1;
  var yyyy = today.getFullYear();

  if (dd < 10) {
    dd = "0" + dd;
  }

  if (mm < 10) {
    mm = "0" + mm;
  }

  theDate = yyyy + '-' + mm + '-' + dd

  numberOfTimes++;
  consin.innerHTML =
    consin.innerHTML +
    `<div class="console-line">[${numberOfTimes}]: Today's date is: ${theDate}</div>`;
}
