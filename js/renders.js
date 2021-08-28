function renderResponsePERT(r) {
    const rutaC = new Set(r.rutaCritica);
    let header = document.getElementById("PERTHeader");
    if (header.cells.length === 6) {
        header.insertAdjacentHTML("beforeend", '<th scope="col">Duración Estimada</th><th scope="col">Varianza</th>');
    }
    let table = document.getElementById("innerTablaPERT");
    let idx = 0;
    for (let row of table.rows) {
        const activida = row.cells[1].childNodes[0].value.trim();
        const predecesora = row.cells[2].childNodes[0].value.trim();
        if (row.cells.length != 6) {
            row.removeChild(row.lastChild);
            row.removeChild(row.lastChild);
        }
        const tdClass = (rutaC.has(activida) && rutaC.has(predecesora)) ? "cambio" : "";
        insertCell(row, r.estimaciones[idx].toFixed(3), tdClass);
        insertCell(row, r.varianzas[idx].toFixed(3), tdClass);
        idx += 1;
    }
    varianza = r.sumaVariazas;
    media = r.media;
    let response = `μ = ${r.media.toFixed(3)}, σ² = ${r.sumaVariazas.toFixed(3)}`;
    document.getElementById("imagenPERT").src = `${drawGraphLinkCritical(r.cpm)}`;
    document.getElementById("respuestasPERT").innerHTML = response;
}
function renderResponseFlujo(r) {
    let respuesta = document.getElementById("respuestaFlujo");
    const dirigido = document.getElementById("GrafoDirigido");
    let respHTML = `<p>Flujo Máximo: ${r.Flujo}</p><br>
    <table class="table table-hover">
    <thead class="thead-light"><tr>
    <th scope="col">Origen</th>
    <th scope="col">Destino</th>
    <th scope="col">Peso</th>
  </tr></thead><tbody>`;
    let iter = 0;
    for (const e of r.Data) {
        respHTML += `<tr class="table-primary"><td class="success">
      ${e.camino}</td><td colspan="2">${graphButton(`flujo_${iter}`, drawGraphLink(e.data, e.camino, dirigido.checked))}
      </td></tr>`;
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
        table.insertAdjacentHTML("beforeend", `<thead><tr><td class="table-primary">Iteración ${idx}</td>${nodesHeader}<tr></thead>`);
        for (const a of r.nodos) {
            let row = table.insertRow();
            insertCell(row, a, "table_nodes");
            for (const b of r.nodos) {
                for (const n of iteracion) {
                    if (n.origen == a && n.destino == b) {
                        const v = (n.peso == Number.MAX_VALUE) ? '∞' : String(n.peso);
                        if (cambios.has(JSON.stringify({ iteracion: idx, origen: a, destino: b }))) {
                            insertCell(row, v, "cambio");
                        }
                        else {
                            insertCell(row, v);
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
    let respHTML = `<br><p>Duración Total: ${r.duracionTotal}</p><br>`;
    respHTML += `<img src="${drawGraphLinkCritical(r)}" width="999" height="360" class="center img-fluid"><br><br>`;
    let respuesta = document.getElementById("respuestaCPM");
    clearElement(respuesta);
    respuesta.insertAdjacentHTML("afterbegin", respHTML);
    respuesta.style.setProperty("display", "block", 'important');
    respuesta.scrollIntoView(true);
}
function renderResponseCompresion(r) {
    let tableHeader = document.getElementById("CompresionHeader");
    if (tableHeader.cells.length === 7) {
        tableHeader.insertAdjacentHTML("beforeend", '<th scope="col">P<sub>ij</sub></th>');
    }
    let table = document.getElementById("innerTablaCompresion");
    let idx = 0;
    for (let row of table.rows) {
        if (row.cells.length != 7) {
            row.removeChild(row.lastChild);
        }
        insertCell(row, r.costoTiempo[idx].toFixed(3));
        idx += 1;
    }
    let rh = document.createElement("div");
    const newLine = document.createElement("br");
    for (const [idx, iter] of r.iteraciones.entries()) {
        rh.appendChild(newTextElement(`Duración: ${iter.duracionTotal}`, "h4"));
        rh.appendChild(newTextElement(`Costo: $${r.costoActual[idx].toFixed(2)}`, "h4"));
        rh.appendChild(newLine.cloneNode());
        rh.appendChild(newImageElement(drawGraphLinkCritical(iter), 999, 360));
        rh.appendChild(newLine.cloneNode());
        if (r.actividadesComprimidas[idx] != undefined) {
            rh.appendChild(newTextElement(`Compresión: ${r.actividadesComprimidas[idx]}`));
        }
        rh.appendChild(newLine.cloneNode());
        rh.appendChild(newLine.cloneNode());
    }
    let respuesta = document.getElementById("respuestasCompresion");
    clearElement(respuesta);
    respuesta.appendChild(rh);
    document.getElementById("Compresion").style.setProperty("display", "block", 'important');
}
function renderResponseDijkstra(data) {
    let nodesHeader = `<thead><tr><th scope="col" style="font-weight:bold;"></th>`;
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
            for (let col = 0; col < data.tabla[idx].length; col++) {
                if (colorear(data.coords, idx, col)) {
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
    clearElement(respuesta);
    window.clearInterval(kruskalInterval);
    respuesta.appendChild(newTextElement(`Peso: ${data.peso}`, "h4"));
    respuesta.innerHTML += data.slides;
    kruskalInterval = window.setInterval(showSlides, 300);
}
function showSlides() {
    let slides = document.getElementsByClassName("slides");
    for (const slide of slides) {
        slide.style.display = "none";
    }
    slideIndex += 1;
    if (slideIndex > slides.length) {
        slideIndex = 1;
    }
    slides[slideIndex - 1].style.display = "block";
}
