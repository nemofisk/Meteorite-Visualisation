/* 
TODO:
    Clarifications (Years, click hold to zoom)
    Hover visuals
    Legend selection feedback
    Fonts
    Colors
*/



const wSvg = 1400, hSvg = 800;
let wViz, hViz;
let wPad, hPad;


const svg = d3.select("#visualisation").append("svg");

svg
    .attr("width", wSvg)
    .attr("height", hSvg)
    .style("background-color", "none")

var projection = d3.geoEquirectangular()
    .center([0, 0])
    .scale(152.63)

let rectViz = svg.append("rect")

let gViz = svg.append("g")
    .classed("map", true)

var path = d3.geoPath()
    .projection(projection);

let y90 = projection([0, 90])[1];
let y82 = projection([0, 82])[1];


d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (world) {


    gViz
        .selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", "black")
        .style("stroke", "white")
        .style("stroke-width", 0.2);

    let mapDOM = document.querySelector(".map")

    wViz = mapDOM.getBoundingClientRect().right - mapDOM.getBoundingClientRect().left
    hViz = mapDOM.getBoundingClientRect().bottom - mapDOM.getBoundingClientRect().top + 16

    wPad = (wSvg - wViz) / 2;
    hPad = (hSvg - hViz) / 2;

    gViz.attr("transform", `translate(${wPad}, ${hPad - 10})`)

    rectViz
        .attr("width", wViz)
        .attr("height", hViz)
        .attr("transform", `translate(${wPad}, ${hPad})`)
        .attr("fill", "skyblue")

    d3.json("rows.json").then(function (data) {

        let meteoriteData = data.data.filter(meteorite => {
            return meteorite[15] !== null && meteorite[16] !== null &&
                meteorite[15] !== "0.000000" && meteorite[16] !== "0.000000" && meteorite[12] !== null;
        });


        let scaleLatitude = d3.scaleLinear()
            .domain([-180, 180])
            .range([0, wViz]);

        let scaleLongitude = d3.scaleLinear()
            .domain([-90, 90])
            .range([hViz, 0]);

        let xAxisBot = d3.axisBottom(scaleLatitude)
            .ticks(20);

        let xAxisTop = d3.axisTop(scaleLatitude)
            .ticks(20);

        let yAxisLeft = d3.axisLeft(scaleLongitude)
            .ticks(20);

        let yAxisRight = d3.axisRight(scaleLongitude)
            .ticks(20);

        svg.append("g")
            .call(xAxisBot)
            .attr("transform", `translate(${wPad}, ${hPad + hViz})`)
            .attr("stroke-width", 1);

        svg.append("g")
            .call(xAxisTop)
            .attr("transform", `translate(${wPad}, ${hPad})`)
            .attr("stroke-width", 1);

        svg.append("g")
            .call(yAxisLeft)
            .attr("transform", `translate(${wPad}, ${hPad})`)
            .attr("stroke-width", 1);

        svg.append("g")
            .call(yAxisRight)
            .attr("transform", `translate(${wPad + wViz}, ${hPad})`)
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

        let Colors = ["rgb(255, 130, 0)", "rgb(255, 90, 0)", "rgb(255, 50, 0)", "rgb(255, 0, 0)"]
        let scaleColors = d3.scaleQuantize([0, BigBoy], Colors)

        gViz.selectAll("circle")
            .data(meteoriteData)
            .enter()
            .append("circle")
            .style("stroke", "black")
            .style("stroke-width", 0.5)
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

                if (isMouseDown === true && d3selection.attr("r") > 0) {

                    let xPos = parseFloat(d3selection.attr("cx"));
                    let yPos = parseFloat(d3selection.attr("cy"));

                    let date = new Date(d[14])
                    const Fullname = d[8]
                    let name
                    let info = []

                    const year = date.getFullYear()
                    const mass = parseInt(d[12])
                    const lon = d[16]
                    const lat = d[15]

                    if (Fullname.length > 13) {
                        name = Fullname.substring(0, 13);
                        let subName = Fullname.substring(13, 30)

                        info = [
                            `Latitude: ${lat}`,
                            `Longitude: ${lon}`,
                            `Mass: ${mass}`,
                            `Year (Found): ${year}`,
                            `${subName}`,
                            `Name: ${name}`
                        ]

                    } else {
                        name = Fullname;
                        info = [
                            `Latitude: ${lat}`,
                            `Longitude: ${lon}`,
                            `Mass: ${mass}`,
                            `Year (Found): ${year}`,
                            `Name: ${name}`
                        ]
                    }

                    gViz.append("rect")
                        .attr("id", "display")
                        .attr("height", 40)
                        .attr("width", 55)
                        .attr("x", xPos - 25)
                        .attr("y", yPos - 50)
                        .attr("fill", "lightgrey")
                        .style("stroke", "black")
                        .style("stroke-width", 0.5)
                        ;

                    for (let i = 0; i < 6; i++) {
                        gViz.append("text")
                            .attr("class", "displayText")
                            .attr("x", xPos - 23)
                            .attr("y", yPos - 15 - (6 * i))
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

        function setR(d, i, nodes) {
            return scaleMeteorite(d[12])
        }
        function setColor(d, i, nodes) {
            return scaleColors(d[12])
        }


        let legendColors = ["rgb(255, 130, 0)", "rgb(255, 90, 0)", "rgb(255, 50, 0)", "rgb(255, 0, 0)"]
        let legendLabels = ["0M to 15M", "15M to 30M", "30M to 45M", "45M to 60M"];
        let scaleLegend = d3.scaleOrdinal(legendLabels, legendColors)

        let LegendsColor = d3.legendColor()
            .shapePadding(5)

            .title("Avg Mass (g)")
            .scale(scaleLegend)
            .on("cellclick", e => {
                let target = e.target

                if (target.nodeName == "rect") {
                    target = target.parentElement.childNodes[1];
                }

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
                        .attr("r", d => {
                            return scaleMeteorite(d[12]);
                        })
                }

                const year = parseInt(d3.select(".parameter-value > text")
                    .text())

                updateCircles(year)
            })


        svg.append("g")
            .attr("transform", `translate(${wViz + wPad + (wPad / 4)},${hPad + 10})`)
            .classed("legend", true)
            .call(LegendsColor)

        d3.selectAll(".swatch")
            .style("stroke", "black")
            .style("stroke-width", 0.5)
            .attr("rx", 100)
            .attr("ry", 100)
            .attr("width", (d, i) => {
                return 7.5 + (3 * i)
            })
            .attr("height", (d, i) => {
                return 7.5 + (3 * i)
            })
            .attr("x", (d, i) => {
                return -1 + (-1.37 * i)
            })
            .attr("y", (d, i) => {
                let index = [3, 2, 1, 0];

                return 0.7 * index[i]
            })

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
            .tickFormat(d3.format("04d"))
            .ticks(0)
            .displayValue(true)
            .fill("black")
            .on('onchange', (val) => {
                updateCircles(val)
            });


        let gSlider = svg.append('g')
            .attr('transform', `translate(${(wSvg / 2) - 400}, ${hPad / 2 - 13})`)
            .classed("gSlider", true)
            .call(slider);

        svg.append('text')
            .attr('x', (wSvg / 2))
            .attr('y', hPad / 2 - 30)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .text("Years (Found/fell)");

        svg.append('text')
            .attr('x', (wSvg / 2) - 440)
            .attr('y', hPad / 2 - 8)
            .attr("fill", "white")
            .text(firstYear);

        svg.append('text')
            .attr('x', (wSvg / 2) + 420)
            .attr('y', hPad / 2 - 8)
            .attr("fill", "white")
            .text(lastYear);

        svg.append('text')
            .attr('x', (wSvg / 2) + 515)
            .attr('y', hPad + 150)
            .attr("fill", "white")
            .text("Click and hold to zoom in!");

        let legendElement = document.querySelector(".legendCells")

        updateCircles(slider.value());

        function updateCircles(value) {

            let selectedColor = false;
            let target;

            if (legendElement.querySelector(".selected")) target = legendElement.querySelector(".selected").parentNode.childNodes[0]


            if (target) selectedColor = d3.select(target).style("fill");

            d3.selectAll("circle")
                .attr("r", d => {
                    let rave_date = new Date(d[14]);
                    let rave_year = rave_date.getFullYear();
                    if (rave_year == value || rave_year < value) {
                        if (selectedColor) {
                            if (scaleColors(d[12]) == selectedColor) {
                                return scaleMeteorite(d[12])
                            }
                            return 0;
                        }
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
});

svg.on("mousemove", e => {
    if (isMouseDown === true) {
        zoomFunction(e)
    }
})

function zoomFunction(event) {

    const sSvg = document.querySelector("#visualisation > svg")
    const distanceToTop = sSvg.getBoundingClientRect().top;

    let xCoordinate = event.x
    let yCoordinate = event.y - distanceToTop

    let zoomFactor = 3;


    let svgWidth = wSvg;
    let svgHeight = hSvg;


    let xWindow = Math.max(0, xCoordinate - (svgWidth / (2 * zoomFactor)));
    let yWindow = Math.max(0, yCoordinate - (svgHeight / (2 * zoomFactor)));
    let xEndWindow = Math.min(svgWidth, xCoordinate + (svgWidth / (2 * zoomFactor)));
    let yEndWindow = Math.min(svgHeight, yCoordinate + (svgHeight / (2 * zoomFactor)));

    svg.attr("viewBox", `${xWindow},${yWindow},${xEndWindow - xWindow},${yEndWindow - yWindow}`);
}