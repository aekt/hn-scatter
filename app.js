"use strict";

const maxScore = 500;
const maxComment = 500;
const maxStory = 10;

const margin = {top: 30, right: 30, bottom: 30, left: 30};
const maxTick = 5;
const scatterSize = 7;

const svgWidth = 600;
const svgHeight = 600;
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

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

let plot = d3.select("body").append("div");
plot.attr("align", "center");

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


let firebase = "https://hacker-news.firebaseio.com";
let newstories = "/v0/newstories.json";
let topstories = "/v0/topstories.json";
let beststories = "/v0/beststories.json";
let getItem = ((id) => "/v0/item/" + id.toString() + ".json");

let items = {};
let currentItem;

let overItemBox = d3.select("body").append("div");
let highItemsBox = d3.select("body").append("div");

overItemBox.style("min-height", "3em");

highItemsBox.append("span").text("Over 500 points/comments:");
highItemsBox.append("br");

function showItem(id, div) {

    let item = items[id];
    let title = item.title;
    let url = item.url;
    let score = item.score;
    let descendants = item.descendants;

    div.append("span")
	.text("(" + score + " point" + (score > 1 ? "s" : "") + " | ");
    div.append("span").append("a")
	.text(descendants + " comment" + (descendants > 1 ? "s" : ""))
	.attr("href", "https://news.ycombinator.com/item?id=" + id);
    div.append("span")
        .text(") ");
    div.append("span").append("a")
	.text(title)
	.attr("href", url);
    div.append("br");
}

function plotItem(id) {

    let x = items[id].score;
    let y = items[id].descendants;

    if (x == undefined || y == undefined) return;

    if (x > maxScore || y > maxComment) {
	showItem(id, highItemsBox);
	return;
    }
    
    g.append("circle")
	.attr("class", `dot${id}`)
        .attr("cx", xScale(x))
	.attr("cy", yScale(y))
	.attr("r", scatterSize)
	.on("mouseover", () => {
	    if (currentItem != id) {
		currentItem = id;
		overItemBox.selectAll("*").remove();
		showItem(id, overItemBox);
	    }
	});
}

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
            let maxStory = Math.min(100, json.length);
            for (let i = 0; i < maxStory; i++) {
                fetchItem(json[i]);
            }
        });
}

run();
