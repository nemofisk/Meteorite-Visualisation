const wSvg = 800, hSvg = 600;
const wViz = wSvg * 1, hViz = hSvg * 1;
const hPad = (hSvg - hViz) / 2, wPad = (wSvg - wViz) / 2;

// Define the SVG element
const svg = d3.select("body").append("svg");
svg
    .attr("width", wSvg)
    .attr("height", hSvg)
    .style("border", "2px solid black");

// Define map projection (you can choose a different projection)
var projection = d3.geoMercator()
    .center([0, 0]) // Centered at [0, 0] by default
    .scale(105)     // Adjust scale as needed
    .translate([400, 300]); // Translate to center of SVG



// Create a path generator
var path = d3.geoPath()
    .projection(projection);

// Load and display the map data (e.g., GeoJSON)
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (world) {
    svg.selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "black")
        .style("stroke", "lightgrey")
        .style("stroke-width", 0.2)


    // Plot circles on the map

    d3.json("rows.json").then(function (data) {
        // Filter out meteorite data with non-zero coordinates
        let meteoriteData = data.data.filter(meteorite => {
            return meteorite[15] !== null && meteorite[16] !== null &&
                meteorite[15] !== "0.000000" && meteorite[16] !== "0.000000";
        });

        
        let BigBoy = 0;
        for (let d of meteoriteData) {
            if (parseInt(d[12]) > BigBoy) {
                BigBoy = parseInt(d[12])
            }
        }


        let scaleMeteorite = d3.scaleLinear()
            .domain([0, BigBoy])
            .range([1, 10])

        let Colors = [" rgb(255, 130, 0)", "rgb(255, 110, 0)", "rgb(255, 90, 0)", "rgb(255, 50, 0)", "rgb(255, 0, 0)"]
        let scaleColors = d3.scaleQuantize([0, BigBoy], Colors)





        console.log(meteoriteData);

        // Add circles for meteorites
        svg.selectAll("circle")
            .data(meteoriteData)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                let number = projection([parseFloat(d[16]), parseFloat(d[15])])[0];

                if (number === 497.56299761527197) {
                    console.log(d);
                }

                return number;
            })
            .attr("cy", function (d) {
                return projection([parseFloat(d[16]), parseFloat(d[15])])[1];
            })
            .attr("r", setR) // Adjust circle radius as needed
            .style("fill", setColor)
            .on("mouseover", event => {
                console.log(event);
            })


        function setR(d, i, nodes) {

            return scaleMeteorite(d[12])
        }
        function setColor(d, i, nodes) {


            return scaleColors(d[12])
        }
    });

})
