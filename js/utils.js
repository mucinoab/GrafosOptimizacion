"use strict";
function clearElement(e) {
    while (e.firstChild && e.removeChild(e.firstChild))
        ;
}
function newElement(tagType, id = "", className = "") {
    const ele = document.createElement(tagType);
    ele.className = className;
    ele.id = id;
    return ele;
}
function newInputElement(className, placeholder = "") {
    let input = document.createElement("input");
    input.type = "text";
    input.required = true;
    input.placeholder = placeholder;
    input.className = `form-control ${className}`;
    return input;
}
function newTextElement(value, tagType = "p") {
    let txt = document.createElement(tagType);
    txt.innerText = value;
    return txt;
}
function newImageElement(src, w, h) {
    let img = document.createElement("img");
    img.className = "center img-fluid";
    img.src = src;
    img.width = w;
    img.height = h;
    return img;
}
function putCell(r, value, className = "", pos = -1) {
    let c = r.insertCell(pos);
    c.innerHTML = value;
    c.className = className;
}
async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response.json();
}
function findStrip(str, needle) {
    const idx = str.indexOf(needle);
    if (idx === -1) {
        return str;
    }
    else {
        return str.slice(0, idx);
    }
}
function normalCDF(x, mean, variance) {
    const z = (x - mean) / Math.sqrt(variance);
    const t = 1 / (1 + .2315419 * Math.abs(z));
    const d = .3989423 * Math.exp(-z * z / 2);
    let prob = d * t * (.3193815 + t * (-.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (z > 0)
        prob = 1 - prob;
    return prob;
}
function renderDot(id, dot) {
    d3.select(id)
        .graphviz()
        .width(window.screen.width * .6)
        .renderDot(dot);
}
