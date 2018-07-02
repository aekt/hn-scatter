"use strict";

// Axes

let maxScore = 600;
let maxComment = 600;
let maxStory = 10;

let margin = {top: 30, right: 30, bottom: 30, left: 30};
let maxTick = 5;
let maxRadius = 7;

let svgWidth = document.body.clientWidth;
let svgHeight = document.body.clientHeight;
let width = Math.min(800, svgWidth - margin.left - margin.right);
let height = Math.min(800, svgHeight - margin.top - margin.bottom);

margin.left = margin.right = (svgWidth - width) / 2;
margin.top = margin.bottom = (svgHeight - height) / 2;

let xScale = d3.scaleLinear()
    .domain([0, maxScore])
    .range([0, width]);

let yScale = d3.scaleLinear()
    .domain([0, maxComment])
    .range([height, 0]);

let xAxis = d3.axisBottom(xScale)
    .ticks(maxTick)
    .tickSize(-height); 

let yAxis = d3.axisLeft(yScale)
    .ticks(maxTick)
    .tickSize(-width);

let plot = d3.select("body")
    .append("div")
    .attr("align", "center");

let svg = plot.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

let g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

g.append("g")
    .call(yAxis);

g.selectAll("path, .tick line")
    .style("stroke", "#eee")
    .style("stroke-width", 2);

g.selectAll(".tick text")
    .style("fill", "grey");



// Dots

let items = {};

function plotItem(id) {
    function plural(number, word) {
        return number + " " + word + (number > 1 ? "s" : "");
    }
    
    function itemTitle(id) {
        return items[id].title;
    }
    
    function itemPoint(id) {
        return plural(items[id].score, "point");
    }
    
    function itemComment(id) {
        return plural(items[id].descendants, "comment");
    }

    let {score, descendants: comment, url} = items[id];
    if (score == undefined || comment == undefined) return;
    
    score = Math.min(score, maxScore);
    comment = Math.min(comment, maxComment);

    let x = xScale(score);
    let y = yScale(comment);
    let r = Math.max(3, maxRadius * (score/maxScore + comment/maxComment));
    let offset = r+12;
    let pad = 5;
    let radius = 2;
    
    let a = g.append("a")
        .attr("target", "_blank")
        .attr("href", url || ("https://news.ycombinator.com/item?id="+id));
    
    let c = a.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", r);

    c.on("mouseover", () => {
        let tipGroup = g.append("g")
            .attr("transform", `translate(${x}, ${y-offset})`)
            .attr("id", "tipGroup");
        
        let tipRect = tipGroup.append("rect")
            .attr("fill", "#222");
        
        let tipBox = tipGroup.append("g")
            .attr("id", "tipBox");
        
        tipBox.append("text")
            .text("|")
            .style("text-anchor", "middle");
        
        tipBox.append("text")
            .text(itemTitle(id))
            .attr("dy", "-1.6em")
            .style("text-anchor", "middle");

        tipBox.append("text")
            .text(itemPoint(id))
            .attr("dx", "-0.618em")
            .style("text-anchor", "end");

        tipBox.append("text")
            .text(itemComment(id))
            .attr("dx", "0.618em")
            .style("text-anchor", "start");
        
        tipBox.selectAll("text")
            .style("fill", "#fff");

        let bound = document.querySelector("#tipBox").getBBox();
        tipRect
            .attr("x", bound.x - pad)
            .attr("y", bound.y - pad)
            .attr("rx", radius)
            .attr("ry", radius)
            .attr("width", bound.width + 2 * pad)
            .attr("height", bound.height + 2 * pad);
    });

    c.on("mouseout", () => {
        g.select("#tipGroup")
            .remove();
    });
}

let firebase = "https://hacker-news.firebaseio.com";
let topstories = "/v0/topstories.json";
// let newstories = "/v0/newstories.json";
// let beststories = "/v0/beststories.json";
let getItem = ((id) => "/v0/item/" + id.toString() + ".json");

function fetchItem(id) {
    fetch(firebase + getItem(id))
        .then(resp => resp.json())
        .then(json => {
            items[id] = json;
            plotItem(id);
        });
}

function run() {
    fetch(firebase + topstories)
        .then(resp => resp.json())
        .then(json => {
            let maxStory = Math.min(90, json.length);
            for (let i = 0; i < maxStory; i++) {
                fetchItem(json[i]);
            }
        });
}

run();
