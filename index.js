const wSvg = 1000, hSvg = 800
const wViz = wSvg * 1, hViz = hSvg * 1;
const hPad = (hSvg - hViz) / 2, wPad = (wSvg - wViz) / 2

// Define the SVG element
const svg = d3.select("body").append("svg");
svg
  .attr("width", wSvg)
  .attr("height", hSvg)

// Define the map projection
const projection = d3.geoMercator()
  .scale(100)
  .translate([400, 300]);

// Define a path generator
const path = d3.geoPath().projection(projection);

// Load the GeoJSON data
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (data) {
  // Draw the map
  svg.selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "#000")
    .attr("fill", "#ccc");

  // Sample data with longitude and latitude coordinates
  const cities = [
    { name: "New York", coordinates: [-74.006, 40.7128] },
    { name: "London", coordinates: [-0.1276, 51.5074] },
    { name: "Tokyo", coordinates: [139.6917, 35.6895] }
  ];

  // Add circles for cities
  svg.selectAll("circle")
    .data(cities)
    .enter()
    .append("circle")
    .attr("cx", d => projection(d.coordinates)[0])
    .attr("cy", d => projection(d.coordinates)[1])
    .attr("r", 5)
    .attr("fill", "red")
    .attr("stroke", "#000");
});