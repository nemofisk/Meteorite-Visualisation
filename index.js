const wSvg = 1000, hSvg = 800;
const wViz = wSvg * .85, hViz = hSvg * .85;
const hPad = (hSvg - hViz) / 2, wPad = (wSvg - wViz) / 2;


const svg = d3.select("body").append("svg");
svg
    .attr("width", wSvg)
    .attr("height", hSvg)
    .style("border", "2px solid black");


var projection = d3.geoMercator()
    .center([0, 0])
    .scale(105)
    .translate([400, 300]);


let scaleLongitude = d3.scaleLinear()
    .domain([-180, 180])
    .range([0, wViz])


let scaleLatitude = d3.scaleLinear()
    .domain([-90, 90])
    .range([hViz, 0])

let axisfunctionY = d3.axisLeft(scaleLatitude)
    .ticks(20)

svg.append("g")
    .call(axisfunctionY)
    .attr("transform", `translate(${wPad}, ${hPad})`)
    .attr("stroke-width", 3)

let axisfunctionX = d3.axisBottom(scaleLongitude)
    .ticks(20)

svg.append("g")
    .call(axisfunctionX)
    .attr("transform", `translate(${wPad}, ${hPad + hViz})`)
    .attr("stroke-width", 3)


svg.append("rect")
    .attr("width", wViz)
    .attr("height", hViz)
    .attr("transform", `translate(${wPad}, ${hPad})`)
    .attr("fill", "white")


let gViz = svg.append("g")
    .attr("transform", `translate(${wPad}, ${hPad})`)


var path = d3.geoPath()
    .projection(projection);


d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (world) {
    gViz.selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "black")
        .style("stroke", "lightgrey")
        .style("stroke-width", 0.2)



    d3.json("rows.json").then(function (data) {

        let meteoriteData = data.data.filter(meteorite => {
            return meteorite[15] !== null && meteorite[16] !== null &&
                meteorite[15] !== "0.000000" && meteorite[16] !== "0.000000" && meteorite[12] !== null;
        });


        let BigBoy = 0;
        for (let d of meteoriteData) {
            if (parseInt(d[12]) > BigBoy) {
                BigBoy = parseInt(d[12])
            }
        }


        let scaleMeteorite = d3.scaleLinear()
            .domain([0, BigBoy])
            .range([1, 5])

        let Colors = [" rgb(255, 130, 0)", "rgb(255, 110, 0)", "rgb(255, 90, 0)", "rgb(255, 50, 0)", "rgb(255, 0, 0)"]
        let scaleColors = d3.scaleQuantize([0, BigBoy], Colors)



        gViz.selectAll("circle")
            .data(meteoriteData)
            .enter()
            .append("circle")
            .attr("data-indexNumber", setData)
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
            .attr("r", setR)
            .attr("id", function (d) { d[9] })
            .style("fill", setColor)
            .on("mouseover", event => {
                if (isMouseDown === true) {

                    let circleId = event.target.attributes[0].nodeValue;
                    let hoveredData = meteoriteData.find(d => d[9] === circleId);

                    let xPos = parseFloat(event.target.attributes[1].nodeValue);
                    let yPos = parseFloat(event.target.attributes[2].nodeValue);

                    gViz.append("rect")
                        .attr("id", "display")
                        .attr("height", 40)
                        .attr("width", 50)
                        .attr("x", xPos)
                        .attr("y", yPos)
                        .attr("fill", "blue");

                    gViz.append("text")
                        .attr("id", "displayText")
                        .attr("x", xPos)
                        .attr("y", yPos + 20)
                        .attr("fill", "black")
                        .text(`
                            Name: ${hoveredData[8]}
                            Mass: ${hoveredData[9]}g
                            Longitude: ${hoveredData[15]}
                            Latitude: ${hoveredData[16]}
                        `)


                }

            }).on("mouseout", e => {
                if (isMouseDown === true) {
                    gViz.select("#display").remove()
                    gViz.select("#displayText").remove()
                }
            })

        function setData(d, i, nodes) {
            return i;
        }

        function setR(d, i, nodes) {
            return scaleMeteorite(d[12])
        }
        function setColor(d, i, nodes) {
            return scaleColors(d[12])
        }


        let LegendsColor = d3.legendColor()
            .scale(scaleColors)
            .on("cellclick", e => {
                let target = e.target
                let d3target = d3.select(target);

                let selected;

                if (d3target.classed("selected")) {
                    d3target.classed("selected", false)
                    selected = false;
                } else {

                    d3.selectAll("text.label")
                        .classed("selected", false);

                    d3target.classed("selected", true)
                    selected = true;
                }

                let color = target.parentElement.__data__;

                if (selected) {
                    gViz.selectAll("circle")
                        .attr("opacity", d => {
                            let circleColor = scaleColors(parseInt(d[12]))

                            if (circleColor === color) {
                                return 1
                            }
                            return 0;
                        })
                } else {
                    gViz.selectAll("circle")
                        .attr("opacity", 1)
                }


            })

        svg.append("g")
            .attr("transform", `translate(${wViz - 50},${hPad})`)
            .call(LegendsColor)

    });

})
let isMouseDown = false;

svg.on("mousedown", () => {
    isMouseDown = true;
});

svg.on("mouseup", () => {
    isMouseDown = false;
    svg.attr("viewBox", `${0},${0},${wSvg},${hSvg}`)
    gViz.select("#display").remove()
    gViz.select("#displayText").remove()
});

svg.on("mousemove", e => {
    if (isMouseDown === true) {
        zoomFunction(e)
    }
})

function zoomFunction(event) {
    let xCoordinate = event.x
    let yCoordinate = event.y

    let zoomFactor = 3;


    let svgWidth = wSvg;
    let svgHeight = hSvg;


    let xWindow = Math.max(0, xCoordinate - (svgWidth / (2 * zoomFactor)));
    let yWindow = Math.max(0, yCoordinate - (svgHeight / (2 * zoomFactor)));
    let xEndWindow = Math.min(svgWidth, xCoordinate + (svgWidth / (2 * zoomFactor)));
    let yEndWindow = Math.min(svgHeight, yCoordinate + (svgHeight / (2 * zoomFactor)));

    svg.attr("viewBox", `${xWindow},${yWindow},${xEndWindow - xWindow},${yEndWindow - yWindow}`);
}

