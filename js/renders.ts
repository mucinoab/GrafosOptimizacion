function renderResponsePERT(r: ResponsePERT) {
  const rutaC = new Set(r.rutaCritica);

  let header = <HTMLTableRowElement>document.getElementById("PERTHeader");
  if (header.cells.length === 6) {
    header.insertAdjacentHTML("beforeend", '<th scope="col">Duración Estimada</th><th scope="col">Varianza</th>');
  }

  let table = <HTMLTableElement>document.getElementById("innerTablePERT");
  let idx = 0;

  for (let row of table.rows) {
    // Segunda  y tercer columna de tabla, "Actividad" y "Predecesora"
    const activida = (<HTMLInputElement>row.cells[1].childNodes[0]).value.trim();
    const predecesora = (<HTMLInputElement>row.cells[2].childNodes[0]).value.trim();

    if (row.cells.length != 6) {
      row.removeChild(row.lastChild);
      row.removeChild(row.lastChild);
    }

    const tdClass = (rutaC.has(activida) && rutaC.has(predecesora)) ? "cambio" : "";
    putCell(row, r.estimaciones[idx].toFixed(3), tdClass);
    putCell(row, r.varianzas[idx].toFixed(3), tdClass);

    idx += 1;
  }

  renderDotGraph("imagenPERT", drawGraphLinkCritical(r.cpm));

  varianza = r.sumaVariazas;
  media = r.media;

  const response = document.getElementById("respuestasPERT");

  response.innerText = `μ = ${r.media.toFixed(3)}, σ² = ${r.sumaVariazas.toFixed(3)}`;
  response.scrollIntoView(true);
}

function renderResponseMaxFlow(r: MaxFlowSolution) {
  let respuesta = document.getElementById("respuestaFlujo");
  const dirigido = true;

  let respHTML: string = `<p>Flujo Máximo: ${r.flow}</p><br>
    <table class="table table-hover" style="max-width: 80%;">
    <thead class="thead-light table-header"><tr>
    <th scope="col">Origen</th>
    <th scope="col">Destino</th>
    <th scope="col">Peso</th>
  </tr></thead><tbody>`;

  let graphs = [];

  let iter = 0;
  for (const e of r.steps) {
    respHTML += `<tr class="table-primary"><td class="success">
      ${e.path_used}</td><td colspan="2">${graphButton(`flujo_${iter}`)}
      </td></tr>`;

    graphs.push([`imagenflujo_${iter}`, createGraph(e.graph, e.path_used, dirigido)]);

    for (const v of e.graph) {
      respHTML += `
        <tr><td>${v.source}</td>
        <td>${v.target}</td>
        <td>${v.weight}</td></tr> `;
    }
    iter += 1;
  }
  respHTML += "</tbody></table>"

  clearElement(respuesta);

  respuesta.insertAdjacentHTML("afterbegin", respHTML);
  respuesta.style.setProperty("display", "block", 'important');
  graphs.forEach(g => renderDotGraph(g[0], g[1]));
}

function renderResponseFloyd(r: ResponseFloydW) {
  const cambios = new Set();

  for (const cambio of r.cambios) {
    cambios.add(JSON.stringify(cambio));
  }

  let nodesHeader = "";
  for (const n of r.nodos) {
    nodesHeader += `<td style="font-weight:bold;">${n}</td>`;
  }

  let table: HTMLTableElement = document.createElement("table");
  table.className = "table table-hover";
  table.style.setProperty("max-width", "80%");

  for (const [idx, iteracion] of r.iteraciones.entries()) {
    table.insertAdjacentHTML("beforeend", `<tr class="table-header"><td class="table-primary">Iteración ${idx}</td>${nodesHeader}<tr>`);

    for (const a of r.nodos) {
      let row = table.insertRow();
      putCell(row, a, "table_nodes");

      for (const b of r.nodos) {
        for (const n of iteracion) {
          if (n.source == a && n.target == b) {
            const v: string = (n.weight == Number.MAX_VALUE) ? '∞' : String(n.weight);

            if (cambios.has(JSON.stringify({ iteracion: idx, origen: a, destino: b }))) {
              // A change in value
              putCell(row, v, "cambio");
            } else {
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
  const tiempo = parseFloat((<HTMLInputElement>document.getElementById("tiempoID")).value);

  if (isNaN(tiempo)) {
    alert("Por favor ingresa un número válido.");
    return;
  }

  let r = document.getElementById("normalCDF");
  r.innerHTML = `${(normalCDF(tiempo, media, varianza) * 100).toFixed(4)} %`;
}

function renderResponseCPM(r: ResponseCPM) {
  renderDotGraph("imagenCPM", drawGraphLinkCritical(r));

  const respuesta = document.getElementById("respuestaCPM");
  respuesta.innerText = `Duración Total: ${r.duracionTotal}`;
  respuesta.scrollIntoView(true);
}

function renderResponseCompresion(r: ResponseCompresion) {
  let tableHeader = <HTMLTableRowElement>document.getElementById("AceleracionHeader");
  if (tableHeader.cells.length === 7) {
    tableHeader.insertAdjacentHTML("beforeend", '<th scope="col">P<sub>ij</sub></th>');
  }

  let table = <HTMLTableElement>document.getElementById("innerTableAceleracion");
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
  let graphs: Array<[string, ResponseCPM]> = [];

  for (const [idx, iter] of r.iteraciones.entries()) {
    rh.appendChild(newTextElement(`Duración: ${iter.duracionTotal}`, "h4"));
    rh.appendChild(newTextElement(`Costo: $${r.costoActual[idx].toFixed(2)}`, "h4"));
    rh.appendChild(newLine.cloneNode());

    rh.appendChild(newElement("div", `compresion-${idx}`, "grafo-svg"));
    graphs.push([`compresion-${idx}`, iter]);

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

  graphs.forEach(g => renderDotGraph(g[0], drawGraphLinkCritical(g[1])));
}

function renderResponseDijkstra(data: ResponseDijkstra) {
  let nodesHeader = `<thead class="table-header"><tr><th scope="col" style="font-weight:bold;"></th>`;
  for (const b of data.bases) {
    nodesHeader += `<th scope="col" style="font-weight:bold;">${b}</th>`;
  }
  nodesHeader += `<th scope="col" style="font-weight:bold;">Bases</th>`;
  nodesHeader += `<th scope="col" style="font-weight:bold;">Arcos</th>`;
  nodesHeader += "</tr></thead>";

  let table: HTMLTableElement = document.createElement("table");
  table.className = "table table-hover";
  table.style.setProperty("max-width", "80%");
  table.insertAdjacentHTML("beforeend", nodesHeader);

  let nodosBody: string = "<tbody>";

  for (let idx = 0; idx < data.tabla.length; idx++) {
    if (data.tabla[idx]) {
      nodosBody += `<tr><th scope=\"row\">${data.bases[idx]}</th>`

      for (let col = 0; col < data.tabla[idx].length; col += 1) {

        // Color the cell
        if (data.coords.some(c => c.row === idx && c.col === col)) {
          nodosBody += `<td class="cambio">${data.tabla[idx][col]}</td>`;
        } else {
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

function renderResponseKruskal(data: Kruskal) {
  const respuesta = document.getElementById("respuestaKruskal");

  clearTimeout(KruskalTimeOut);
  clearElement(respuesta);
  respuesta.appendChild(newTextElement(`Peso: ${data.tree_weight}`, "h4"));
  respuesta.appendChild(newElement("div", "kruskal-graph", "grafo-svg"));

  const frames = data.dot_graph_frames;
  let dotIndex = 1;

  renderDotGraph("kruskal-graph", frames[0]);

  function renderAnimation() {
    KruskalTimeOut = setTimeout(() => {
      renderDotGraph("kruskal-graph", frames[dotIndex]);
      dotIndex = (dotIndex + 1) % frames.length;
      renderAnimation();
    }, 750);
  }

  renderAnimation();
  // TODO: Render table
}
