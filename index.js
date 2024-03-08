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
svg.append("g")
    .call(axisfunctionY)
    .attr("transform", `translate(${wPad}, ${hPad})`)

let axisfunctionX = d3.axisBottom(scaleLongitude)
svg.append("g")
    .call(axisfunctionX)
    .attr("transform", `translate(${wPad}, ${hPad + hViz})`)


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
            .range([1, 5])

        let Colors = [" rgb(255, 130, 0)", "rgb(255, 110, 0)", "rgb(255, 90, 0)", "rgb(255, 50, 0)", "rgb(255, 0, 0)"]
        let scaleColors = d3.scaleQuantize([0, BigBoy], Colors)


        console.log(meteoriteData);


        gViz.selectAll("circle")
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
            .attr("r", setR)
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
