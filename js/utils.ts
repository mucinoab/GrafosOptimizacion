const MAX_F64 = 1.7976931348623157e308;

// Removes all the inner HTML of an element
function clearElement(e: HTMLElement) {
  while (e.firstChild && e.removeChild(e.firstChild));
}

// Creates new HTML element.
function newElement(tagType: string, id: string = "", className: string = ""): HTMLElement {
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
    headers: { 'Content-Type': 'application/json' },
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
function normalCDF(x: number, mean: number, variance: number): number {
  const z = (x - mean) / Math.sqrt(variance);
  const t = 1 / (1 + .2315419 * Math.abs(z));
  const d = .3989423 * Math.exp(-z * z / 2);

  let prob = d * t * (.3193815 + t * (-.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) prob = 1 - prob;

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
  // TODO Directed and undirected graphs

  const graphContainer = document.getElementById(containerId);
  const errMsg = document.getElementById("drawing-error");
  const narrow_screen = window.matchMedia('all and (max-width: 720px)');

  if (graphContainer === null) return;

  if (narrow_screen.matches) {
    // Draw the graph form top to bottom instead of left to right
    dotGraph = dotGraph.replace("rankdir=LR;", "");
  }

  graphWasm.graphviz.dot(dotGraph, "svg").then((svg: string) => {
    graphContainer.innerHTML = svg;

    let graphSVG = <SVGElement>graphContainer.childNodes[6];

    // Gain the ability to be resized by the parent container.
    graphSVG.removeAttribute("height");
    graphSVG.removeAttribute("width");

    errMsg.style.setProperty("display", "none");
  }, (err: string) => {
    errMsg.innerText = err;
    errMsg.style.setProperty("display", "block");
  });
}

function appendRow(table: HTMLTableElement, tableId: string, i: number, header: boolean) {
  function pushCell(r: HTMLTableRowElement, e: number | string, placeholder = "") {
    let ele;

    if (typeof e == "number") {
      ele = document.createTextNode(String(e));
    } else {
      ele = newInputElement(e, placeholder);
    }

    r.insertCell().appendChild(ele);
  }

  let r = table.insertRow();

  // #, origen, destino, peso, [probable, pesimista]
  pushCell(r, i);
  pushCell(r, `origenes${tableId}`);
  pushCell(r, `destinos${tableId}`);
  pushCell(r, `pesos${tableId}`, "0.0");

  if (header) { // TODO name
    if (tableId === "PERT") {
      // special case PERT
      pushCell(r, `probable${tableId}`, "0.0");
      pushCell(r, `pesimista${tableId}`, "0.0");
    } else {
      // special case Compresion
      pushCell(r, `costo${tableId}`, "0.0");
      pushCell(r, `pesosUrgente${tableId}`, "0.0");
      pushCell(r, `costosUrgente${tableId}`, "0.0");
    }
  }
}

function addRow(): void {
  const tableId = Method[activeTab];
  const nRows = document.getElementById(`${tableId}Header`) != null;
  let table = <HTMLTableElement>document.getElementById(`innerTable${tableId}`);

  appendRow(table, tableId, table.children.length, nRows);
  vertices.value = String(table.children.length);
}

function removeRow(): void {
  let table = document.getElementById(`innerTable${Method[activeTab]}`);

  if (table.children.length == 1) return;

  table.lastChild.remove();
  vertices.value = String(table.children.length);
}

function openSvgInNewTab(svg: SVGAElement): void {
  const blob = new Blob([svg.outerHTML], { type: "image/svg+xml;charset=utf-8" });
  const image = new Image();
  image.src = window.URL.createObjectURL(blob);

  const newWindow = window.open("");
  newWindow.document.write(image.outerHTML);
  newWindow.document.title = "grafo.svg";
}
