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

function run() {
    fetch(firebase + topstories)
	.then(resp => resp.json())
	.then(json => {
            let main = document.querySelector("#main");
            while (main.firstChild) {
                main.removeChild(main.firstChild);
            }

	    let table = document.createElement("table");
	    let tbody = document.createElement("tbody");

            let maxRows = Math.min(30, json.length);
	    for (let i = 0; i < maxRows; i++) {
		tbody.appendChild(makeRow(json[i]));
                fillRow(json[i]);
	    }

	    table.appendChild(tbody);
	    main.append(table);
	});
}

let button = document.querySelector("button");
button.addEventListener("click", run, false);
