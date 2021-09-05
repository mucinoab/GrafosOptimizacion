// Removes all the inner HTML of an element
function clearElement(e: HTMLElement) {
  while(e.firstChild && e.removeChild(e.firstChild));
}

// Creates new HTML element.
function newElement(tagType: string, id: string="", className: string=""): HTMLElement {
  const ele = document.createElement(tagType);
  ele.className = className;
  ele.id = id;

  return ele;
}

function newInputElement(className: string, placeholder: string = ""): HTMLInputElement {
  let input = document.createElement("input");
  input.type = "text";
  input.required = true;
  input.placeholder = placeholder;
  input.className = `form-control ${className}`;

  return input
}

function newTextElement(value: string, tagType: string = "p"): HTMLElement {
  let txt = document.createElement(tagType);
  txt.innerText = value;

  return txt
}

function putCell(r: HTMLTableRowElement, value: string, className: string = "", pos: number = -1) {
  let c = r.insertCell(pos);
  c.innerHTML = value;
  c.className = className;
}

// From MDN, https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
async function postData(url: string, data: { [key: string]: any }) {
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });

  return response.json();
}

function findStrip(str: string, needle: string): string {
  // searches needle and removes everything after, including needle
  // does nothing if needle in not found

  const idx = str.indexOf(needle);
  if (idx === -1) {
    return str;
  } else {
    return str.slice(0, idx);
  }
}

// By Ian H. from https://stackoverflow.com/a/59217784
// Normal Cumulative Distribution
function normalCDF(x: number, mean: number , variance: number): number {
  const z = (x - mean) / Math.sqrt(variance);
  const t = 1 / (1 + .2315419 * Math.abs(z));
  const d =.3989423 * Math.exp( -z * z / 2);

  let prob = d * t * (.3193815 + t * ( -.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if( z > 0 ) prob = 1 - prob;

  return prob;
}

function debounce(func: () => void, timeout: number) {
  let timer: number;

  return () => {
    clearTimeout(timer);
    timer = setTimeout(func, timeout);
  };
}

function renderDotGraph(containerId: string, dotGraph: string) {
  //Reference: https://www.graphviz.org/doc/info/lang.html

  const graphContainer = document.getElementById(containerId);
  if (graphContainer === null) return;

  graphWasm.graphviz.dot(dotGraph, "svg").then((svg: string) => {
    graphContainer.innerHTML = svg;

    let graphSVG = <SVGElement>graphContainer.childNodes[6];
    graphSVG.removeAttribute("height"); // To be resized by the parent container.
    graphSVG.removeAttribute("width");
  }, (_: any) => { /* TODO: Report the error */ });
}
