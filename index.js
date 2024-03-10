const wSvg = 1200, hSvg = 800;
const wViz = wSvg * .70, hViz = hSvg * .70;
const hPad = (hSvg - hViz) / 2, wPad = (wSvg - wViz) / 2;

const svg = d3.select("#visualisation").append("svg");
svg
    .attr("width", wSvg)
    .attr("height", hSvg)
    .style("border", "2px solid black")

var projection = d3.geoNaturalEarth1()
    .center([0, 0])
    .scale(175)
    .translate([wViz / 2, hViz / 2]);

svg.append("rect")
    .attr("width", wViz)
    .attr("height", hViz)
    .attr("transform", `translate(${wPad}, ${hPad})`)
    .attr("fill", "skyblue")

let gViz = svg.append("g")
    .attr("transform", `translate(${wPad}, ${hPad})`);

var path = d3.geoPath()
    .projection(projection);

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (world) {
    gViz.selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "grey")
        .style("stroke", "lightgrey")
        .style("stroke-width", 0.2);

    d3.json("rows.json").then(function (data) {

        let meteoriteData = data.data.filter(meteorite => {
            return meteorite[15] !== null && meteorite[16] !== null &&
                meteorite[15] !== "0.000000" && meteorite[16] !== "0.000000" && meteorite[12] !== null;
        });

        let lonMax = 0
        let lonMin = 0
        let latMax = 0
        let latMin = 0

        meteoriteData.forEach(meteorite => {

            let lon = parseFloat(meteorite[15])
            let lat = parseFloat(meteorite[16])

            if (lon > lonMax) {
                lonMax = lon
            }
            if (lon < lonMin) {
                lonMin = lon
            }
            if (lat > latMax) {
                latMax = lat
            }
            if (lat < latMin) {
                latMin = lat
            }
        })

        let scaleLatitude = d3.scaleLinear()
            .domain([latMin, latMax])
            .range([0, wViz]);

        let scaleLongitude = d3.scaleLinear()
            .domain([lonMin, lonMax])
            .range([hViz, 0]);

        let axisfunctionYleft = d3.axisLeft(scaleLongitude)
            .ticks(20);

        let axisfunctionYright = d3.axisRight(scaleLongitude)
            .ticks(20);

        svg.append("g")
            .call(axisfunctionYleft)
            .attr("transform", `translate(${wPad}, ${hPad})`)
            .attr("stroke-width", 1);

        svg.append("g")
            .call(axisfunctionYright)
            .attr("transform", `translate(${wPad + wViz}, ${hPad})`)
            .attr("stroke-width", 1);

        let axisfunctionXbot = d3.axisBottom(scaleLatitude)
            .ticks(20);

        let axisfunctionXtop = d3.axisTop(scaleLatitude)
            .ticks(20);

        svg.append("g")
            .call(axisfunctionXbot)
            .attr("transform", `translate(${wPad}, ${hPad + hViz})`)
            .attr("stroke-width", 1);

        svg.append("g")
            .call(axisfunctionXtop)
            .attr("transform", `translate(${wPad}, ${hPad})`)
            .attr("stroke-width", 1);

        let BigBoy = 0;
        for (let d of meteoriteData) {
            if (parseInt(d[12]) > BigBoy) {
                BigBoy = parseInt(d[12])
            }
        }

        let scaleMeteorite = d3.scaleLinear()
            .domain([0, BigBoy])
            .range([2, 5])

        let Colors = ["rgb(255, 130, 0)", "rgb(255, 110, 0)", "rgb(255, 90, 0)", "rgb(255, 50, 0)", "rgb(255, 0, 0)"]
        let scaleColors = d3.scaleQuantize([0, BigBoy], Colors)

        gViz.selectAll("circle")
            .data(meteoriteData)
            .enter()
            .append("circle")
            .attr("opacity", 1)
            .attr("data-indexNumber", setData)
            .attr("cx", function (d) {
                let number = projection([parseFloat(d[16]), parseFloat(d[15])])[0];

                return number;
            })
            .attr("cy", function (d) {
                return projection([parseFloat(d[16]), parseFloat(d[15])])[1];
            })
            .attr("r", setR)
            .attr("id", function (d) { d[9] })
            .style("fill", setColor)
            .on("mouseover", (event, d) => {
                let d3selection = d3.select(event.target);
                console.log(event.target);

                if (isMouseDown === true && d3selection.attr("opacity") == 1) {

                    let xPos = parseFloat(d3selection.attr("cx"));
                    let yPos = parseFloat(d3selection.attr("cy"));

                    const name = d[8]
                    const mass = d[12]
                    const lon = d[15]
                    const lat = d[16]

                    const info = [
                        `Latitude: ${lat}`,
                        `Longitude: ${lon}`,
                        `Mass: ${mass}`,
                        `Name: ${name}`
                    ]

                    gViz.append("rect")
                        .attr("id", "display")
                        .attr("height", 40)
                        .attr("width", 50)
                        .attr("x", xPos - 25)
                        .attr("y", yPos - 50)
                        .attr("fill", "lightgrey")
                        .style("stroke", "black")
                        .style("stroke-width", 0.5)
                        ;

                    for (let i = 0; i < 4; i++) {
                        gViz.append("text")
                            .attr("class", "displayText")
                            .attr("x", xPos - 23)
                            .attr("y", yPos - 15 - (8 * i))
                            .attr("fill", "black")
                            .text(info[i])
                    }

                }

            }).on("mouseout", e => {
                if (isMouseDown === true) {
                    gViz.select("#display").remove()
                    gViz.selectAll(".displayText").remove()
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


        let legendColors = [" rgb(255, 130, 0)", "rgb(255, 110, 0)", "rgb(255, 90, 0)", "rgb(255, 50, 0)", "rgb(255, 0, 0)"]
        let scaleLegend = d3.scaleOrdinal(["0M to 12M", "12M to 24M", "24M to 36M", "36M to 48M", "48M to 60M"], legendColors)

        let LegendsColor = d3.legendColor()
            .scale(scaleLegend)
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

                let color = d3.select(target.parentElement.childNodes[0])
                    .style("fill");

                if (selected) {
                    gViz.selectAll("circle")
                        .attr("opacity", d => {
                            let circleColor = scaleColors(parseInt(d[12]))

                            if (circleColor === color) {
                                return 1
                            }
                            return 0;
                        })
                        .attr("r", d => {
                            let circleColor = scaleColors(parseInt(d[12]))
                            let currentRadius = scaleMeteorite(d[12])
                            if (circleColor !== color) {
                                return 0;
                            }
                            return currentRadius;

                        })

                } else {
                    gViz.selectAll("circle")
                        .attr("opacity", 1)
                        .attr("r", d => {
                            return scaleMeteorite(d[12]);
                        })
                }


            })

        svg.append("g")
            .attr("transform", `translate(${wViz + wPad + (wPad / 4)},${hPad})`)
            .call(LegendsColor)


        let firstYear = 3000;
        let lastYear = 0;

        for (let year of meteoriteData) {
            let rave_date = new Date(year[14]);
            let rave_year = rave_date.getFullYear();

            if (rave_year < firstYear) {
                firstYear = rave_year
            }
        }

        for (let year of meteoriteData) {
            let rave_date = new Date(year[14]);
            let rave_year = rave_date.getFullYear();

            if (rave_year > lastYear) {
                lastYear = rave_year
            }

        }


        var slider = d3
            .sliderHorizontal()
            .min(firstYear)
            .max(lastYear)
            .step(1)
            .width(800)
            .ticks(0)
            .displayValue(true)
            .fill("black")
            .on('onchange', (val) => {
                updateCircles(val)
            });

        d3.select('#slider')
            .append('svg')
            .attr('width', 1200)
            .attr('height', 70)
            .append('g')
            .attr('transform', `translate(${(wSvg / 2) - 400},30)`)
            .call(slider);

        updateCircles(slider.value());

        function updateCircles(value) {
            d3.selectAll("circle")
                .attr("opacity", d => {
                    let rave_date = new Date(d[14]);
                    let rave_year = rave_date.getFullYear();
                    if (rave_year == value || rave_year < value) {
                        return 1;
                    }
                    return 0;
                })
                .attr("r", d => {
                    let rave_date = new Date(d[14]);
                    let rave_year = rave_date.getFullYear();
                    if (rave_year == value || rave_year < value) {
                        return scaleMeteorite(d[12])
                    }
                    return 0;
                })
        }


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
    gViz.selectAll(".displayText").remove()

    d3.select("#sliderDiv")
        .style("display", "")
});

svg.on("mousemove", e => {
    if (isMouseDown === true) {
        d3.select("#sliderDiv")
            .style("display", "none")
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
