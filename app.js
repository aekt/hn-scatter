"use strict";

let firebase = "https://hacker-news.firebaseio.com";

let newstories = "/v0/newstories.json";
let topstories = "/v0/topstories.json";
let beststories = "/v0/beststories.json";

let getItem = ((id) => "/v0/item/" + id.toString() + ".json");
let keyFields = ["score", "descendants", "title"];

function fillRow(id) {
    function fillEntry(e, text) {
	let span = document.querySelector("#r" + id.toString() + " ." + e);
	span.appendChild(document.createTextNode(text));
    }
    
    fetch(firebase + getItem(id))
	.then(resp => resp.json())
	.then(json => {
            for (let field of keyFields) {
                if (json[field] == undefined) continue;
                fillEntry(field, json[field]);
            }
	});
}

function makeRow(id) {
    function makeEntry(cname) {
        let entry = document.createElement("td");
        entry.className = cname;
        return entry;
    }

    let row = document.createElement("tr");
    row.id = "r" + id.toString();
    for (let field of keyFields) {
	row.appendChild(makeEntry(field));
    }
    return row;
}

function run2() {
    
    const svgWidth = 600;
    const svgHeight = 600;
    
    const margin = 30;
    const maxTick = 5;

    const maxScore = 700;
    const maxComment = 700;
    const maxStory = 10;

    const scatterSize = 3;

    let svg = d3.select("body")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    
    let xScale = d3.scaleLinear()
	.domain([0, maxScore])
	.range([margin, svgWidth - margin])
        .nice();

    let yScale = d3.scaleLinear()
	.domain([0, maxComment])
	.range([svgHeight - margin, margin])
        .nice();
    
    let xAxis = d3.axisBottom(xScale)
        .ticks(maxTick);

    let yAxis = d3.axisLeft(yScale)
        .ticks(maxTick);

    function plotStory(id) {
        
        svg.append("g")
            .attr("transform", `translate(0, ${svgHeight-margin})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${margin}, 0)`)
            .call(yAxis);

        fetch(firebase + getItem(id))
            .then(resp => resp.json())
            .then(json => {
                let x = json["score"];
                let y = json["descendants"];
                if (x == undefined || y == undefined) return;
                svg.append("circle")
                    .attr("cx", xScale(x))
		    .attr("cy", yScale(y))
		    .attr("r", scatterSize);
            });
    }

    fetch(firebase + topstories)
        .then(resp => resp.json())
        .then(json => {
            let N = Math.min(maxStory, json.length);
            for (let i = 0; i < N; i++) {
                plotStory(json[i]);
            }
        });
}

function run() {
    fetch(firebase + topstories)
	.then(resp => resp.json())
	.then(json => {
	    let table = document.createElement("table");
	    let tbody = document.createElement("tbody");

            let maxRows = Math.min(10, json.length);
	    for (let i = 0; i < maxRows; i++) {
		tbody.appendChild(makeRow(json[i]));
                fillRow(json[i]);
	    }

	    table.appendChild(tbody);
	    document.body.append(table);
	});
}

run();
run2();
