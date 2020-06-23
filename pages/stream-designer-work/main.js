// Create the layer group
var links = L.layerGroup([]);
var nodes = L.layerGroup([]);
var sensors = L.layerGroup([]);

var links_db = {};

var the_layer;

var clickedLink = null;

// Create handlers for drawing on layer groups

var overlayMaps = {
  Links: links,
  Nodes: nodes,
  Sensors: sensors,
};

// Variables for OSM tiles maps
var osmUrl = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  osmAttrib =
    '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib });
var map = new L.Map("map", {
  layers: [osm, links, nodes, sensors],
  center: new L.LatLng(51.505, -0.04),
  zoom: 13,
});

var polyline_drawing = new L.Draw.Polyline(map);
var marker_drawing = new L.Draw.Marker(map);

L.control.layers(null, overlayMaps).addTo(map);

// map.on(L.Draw.Event.CREATED, function (e) {
//   var type = e.layerType,
//     layer = e.layer;
//   if (type === "polyline") {
//     // Do polyline specific actions
//     console.log("You have drawn a polyline");
//     layer.setStyle({
//       color: "#108777",
//       opacity: "1.0",
//     });
//     layer.on("mouseover", function (e) {
//       layer.setStyle({
//         color: "#d97914",
//       });
//     });
//     layer.on("mouseout", function (e) {
//       layer.setStyle({
//         color: "#108777",
//       });
//     });
//     layer.on("click", function (e) {
//       console.log(layer);
//     });
//     links.addLayer(layer);
//   }
//   if (type === "marker") {
//     // Do polyline specific actions
//     console.log("You have drawn a marker");
//     nodes.addLayer(layer);
//   }
//   // Do whatever else you need to. (save to db; add to map etc)
// });

map.on("draw:drawstop", function (e) {
  map.off("draw:created");
});

/*
 Buttons 
*/

// Button add link function
var draw_link = function () {
  // Change the drawing events according to the draw of links
  map.once("draw:created", function (e) {
    console.log("You have drawn a link");
    var layer = e.layer;
    layer.setStyle({
      color: "#108777",
      opacity: "1.0",
    });
    unselectLink(layer);
    layer.on("click", function (e) {
      console.log(layer._leaflet_id);
      if (clickedLink !== null) {
        unselectLink(clickedLink);
      }
      clickedLink = layer;
      selectLink(clickedLink);
    });
    // Adding a new link to the database
    links.addLayer(layer);
    add_link_to_db(layer._latlngs, layer._leaflet_id);
  });
  if (clickedLink !== null) {
    unselectLink(clickedLink);
  }
  polyline_drawing.enable();
};

var unselectLink = function (layer) {
  layer.editing.disable();
  layer.setStyle({
    color: "#108777",
    opacity: "1.0",
  });
  layer.on("mouseover", function (e) {
    layer.setStyle({
      color: "#d97914",
    });
  });
  layer.on("mouseout", function (e) {
    layer.setStyle({
      color: "#108777",
    });
  });
};

var selectLink = function (layer) {
  layer.off("mouseover");
  layer.off("mouseout");
  // Style for selected link
  layer.setStyle({
    color: "#FF0000",
  });
  layer.editing.enable();
};

// Button add node function
var draw_node = function () {
  // Change the drawing events according to the draw of links
  map.once("draw:created", function (e) {
    console.log("You have drawn a node");
    var layer = e.layer;
    nodes.addLayer(layer);
  });
  marker_drawing.enable();
};

// Button add sensor function
var draw_sensor = function () {
  // Change the drawing events according to the draw of links
  map.once("draw:created", function (e) {
    console.log("You have drawn a sensor");
    var layer = e.layer;

    sensors.addLayer(layer);
  });

  marker_drawing.enable();
};

// Add the link to the db
var add_link_to_db = function (points, id) {
  var xs = [];
  var ys = [];
  points.forEach((e) => {
    xs.push(e.lng);
    ys.push(e.lat);
  });
  links_db[id] = {
    points: [xs, ys],
    type: 1,
    speed: null,
    capacity: null,
    priority: null,
    outgoing_node: null,
    incoming_node: null,
  };
};

// Get the link db in Json format
var get_link_db = function () {
  console.log(JSON.stringify(links_db));
};
