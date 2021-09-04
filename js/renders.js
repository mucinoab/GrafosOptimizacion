"use strict";
function renderResponsePERT(r) {
    const rutaC = new Set(r.rutaCritica);
    let header = document.getElementById("PERTHeader");
    if (header.cells.length === 6) {
        header.insertAdjacentHTML("beforeend", '<th scope="col">Duración Estimada</th><th scope="col">Varianza</th>');
    }
    let table = document.getElementById("innerTablePERT");
    let idx = 0;
    for (let row of table.rows) {
        const activida = row.cells[1].childNodes[0].value.trim();
        const predecesora = row.cells[2].childNodes[0].value.trim();
        if (row.cells.length != 6) {
            row.removeChild(row.lastChild);
            row.removeChild(row.lastChild);
        }
        const tdClass = (rutaC.has(activida) && rutaC.has(predecesora)) ? "cambio" : "";
        putCell(row, r.estimaciones[idx].toFixed(3), tdClass);
        putCell(row, r.varianzas[idx].toFixed(3), tdClass);
        idx += 1;
    }
    renderDot("#imagenPERT", drawGraphLinkCritical(r.cpm));
    varianza = r.sumaVariazas;
    media = r.media;
    const response = document.getElementById("respuestasPERT");
    response.innerText = `μ = ${r.media.toFixed(3)}, σ² = ${r.sumaVariazas.toFixed(3)}`;
    response.scrollIntoView(true);
}
function renderResponseFlujo(r) {
    let respuesta = document.getElementById("respuestaFlujo");
    const dirigido = true;
    let respHTML = `<p>Flujo Máximo: ${r.Flujo}</p><br>
    <table class="table table-hover">
    <thead class="thead-light table-header"><tr>
    <th scope="col">Origen</th>
    <th scope="col">Destino</th>
    <th scope="col">Peso</th>
  </tr></thead><tbody>`;
    let graphs = [];
    let iter = 0;
    for (const e of r.Data) {
        respHTML += `<tr class="table-primary"><td class="success">
      ${e.camino}</td><td colspan="2">${graphButton(`flujo_${iter}`)}
      </td></tr>`;
        graphs.push([`#imagenflujo_${iter}`, drawGraphLink(e.data, e.camino, dirigido)]);
        for (const v of e.data) {
            respHTML += `
        <tr><td>${v.origen}</td>
        <td>${v.destino}</td>
        <td>${v.peso}</td></tr> `;
        }
        iter += 1;
    }
    respHTML += "</tbody></table>";
    clearElement(respuesta);
    respuesta.insertAdjacentHTML("afterbegin", respHTML);
    respuesta.style.setProperty("display", "block", 'important');
}
function renderResponseFloyd(r) {
    const cambios = new Set();
    for (const cambio of r.cambios) {
        cambios.add(JSON.stringify(cambio));
    }
    let nodesHeader = "";
    for (const n of r.nodos) {
        nodesHeader += `<td style="font-weight:bold;">${n}</td>`;
    }
    let table = document.createElement("table");
    table.className = "table table-hover";
    for (const [idx, iteracion] of r.iteraciones.entries()) {
        table.insertAdjacentHTML("beforeend", `<tr class="table-header"><td class="table-primary">Iteración ${idx}</td>${nodesHeader}<tr>`);
        for (const a of r.nodos) {
            let row = table.insertRow();
            putCell(row, a, "table_nodes");
            for (const b of r.nodos) {
                for (const n of iteracion) {
                    if (n.origen == a && n.destino == b) {
                        const v = (n.peso == Number.MAX_VALUE) ? '∞' : String(n.peso);
                        if (cambios.has(JSON.stringify({ iteracion: idx, origen: a, destino: b }))) {
                            putCell(row, v, "cambio");
                        }
                        else {
                            putCell(row, v);
                        }
                        break;
                    }
                }
            }
        }
    }
    let respuesta = document.getElementById("respuestaFloyd");
    clearElement(respuesta);
    respuesta.appendChild(table);
    respuesta.style.setProperty("display", "block", 'important');
}
function renderNormalCDF() {
    const tiempo = parseFloat(document.getElementById("tiempoID").value);
    if (isNaN(tiempo)) {
        alert("Por favor ingresa un número válido.");
        return;
    }
    let r = document.getElementById("normalCDF");
    r.innerHTML = `${(normalCDF(tiempo, media, varianza) * 100).toFixed(4)} %`;
}
function renderResponseCPM(r) {
    renderDot("#imagenCPM", drawGraphLinkCritical(r));
    const respuesta = document.getElementById("respuestaCPM");
    respuesta.innerText = `Duración Total: ${r.duracionTotal}`;
    respuesta.scrollIntoView(true);
}
function renderResponseCompresion(r) {
    let tableHeader = document.getElementById("AceleracionHeader");
    if (tableHeader.cells.length === 7) {
        tableHeader.insertAdjacentHTML("beforeend", '<th scope="col">P<sub>ij</sub></th>');
    }
    let table = document.getElementById("innerTableAceleracion");
    let idx = 0;
    for (let row of table.rows) {
        if (row.cells.length != 7) {
            row.removeChild(row.lastChild);
        }
        putCell(row, r.costoTiempo[idx].toFixed(3));
        idx += 1;
    }
    let rh = document.createElement("div");
    const newLine = document.createElement("br");
    let graphs = [];
    for (const [idx, iter] of r.iteraciones.entries()) {
        rh.appendChild(newTextElement(`Duración: ${iter.duracionTotal}`, "h4"));
        rh.appendChild(newTextElement(`Costo: $${r.costoActual[idx].toFixed(2)}`, "h4"));
        rh.appendChild(newLine.cloneNode());
        rh.appendChild(newElement("div", `compresion-${idx}`, "center img-fluid"));
        graphs.push([`#compresion-${idx}`, iter]);
        rh.appendChild(newLine.cloneNode());
        if (r.actividadesComprimidas[idx] !== undefined) {
            rh.appendChild(newTextElement(`Compresión: ${r.actividadesComprimidas[idx]}`));
            rh.appendChild(newElement("hr"));
        }
        rh.appendChild(newLine.cloneNode());
    }
    const respuesta = document.getElementById("respuestasCompresion");
    clearElement(respuesta);
    respuesta.appendChild(rh);
    for (const graph of graphs) {
        renderDot(graph[0], drawGraphLinkCritical(graph[1]));
    }
}
function renderResponseDijkstra(data) {
    let nodesHeader = `<thead class="table-header"><tr><th scope="col" style="font-weight:bold;"></th>`;
    for (const b of data.bases) {
        nodesHeader += `<th scope="col" style="font-weight:bold;">${b}</th>`;
    }
    nodesHeader += `<th scope="col" style="font-weight:bold;">Bases</th>`;
    nodesHeader += `<th scope="col" style="font-weight:bold;">Arcos</th>`;
    nodesHeader += "</tr></thead>";
    let table = document.createElement("table");
    table.className = "table table-hover";
    table.insertAdjacentHTML("beforeend", nodesHeader);
    let nodosBody = "<tbody>";
    for (let idx = 0; idx < data.tabla.length; idx++) {
        if (data.tabla[idx]) {
            nodosBody += `<tr><th scope=\"row\">${data.bases[idx]}</th>`;
            for (let col = 0; col < data.tabla[idx].length; col += 1) {
                if (data.coords.some(c => c.row === idx && c.col === col)) {
                    nodosBody += `<td class="cambio">${data.tabla[idx][col]}</td>`;
                }
                else {
                    nodosBody += `<td>${data.tabla[idx][col]}</td>`;
                }
            }
        }
        nodosBody += `</tr>`;
    }
    table.insertAdjacentHTML("beforeend", nodosBody);
    let respuesta = document.getElementById("respuestaDijkstra");
    clearElement(respuesta);
    respuesta.appendChild(newTextElement(`Peso: ${data.peso}`, "h4"));
    respuesta.appendChild(document.createElement("br"));
    respuesta.appendChild(table);
    respuesta.style.setProperty("display", "block", 'important');
}
function renderResponseKruskal(data) {
    let respuesta = document.getElementById("respuestaKruskal");
    let dots = data.graphs;
    clearElement(respuesta);
    respuesta.appendChild(newTextElement(`Peso: ${data.peso}`, "h4"));
    respuesta.appendChild(newElement("div", "kruskal-graph", "center img-fluid"));
    let dotIndex = 0;
    const kruskalAnimaiton = d3.select("#kruskal-graph")
        .graphviz()
        .transition(() => {
        return d3.transition("main")
            .ease(d3.easeLinear)
            .duration(700);
    }).on("initEnd", render);
    function render() {
        kruskalAnimaiton
            .renderDot(dots[dotIndex])
            .on("end", function () {
            dotIndex = (dotIndex + 1) % dots.length;
            render();
        });
    }
    respuesta.scrollIntoView(true);
}
