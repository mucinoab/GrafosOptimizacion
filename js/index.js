var varianza = 0;
var media = 0;
function showTable(tablaId, formId, verticesId) {
    const form = document.getElementById(formId);
    if (form.checkValidity()) {
        if (generateTable(tablaId, verticesId)) {
            document.getElementById(tablaId).style.setProperty("display", "block", 'important');
        }
        else {
            alert("Número de vértices NO valido.");
        }
    }
    else {
        form.reportValidity();
    }
}
function generateTable(tablaId, verticesId) {
    const vertices = document.getElementById(verticesId);
    const nRows = document.getElementById(`${tablaId}Header`);
    const nvertices = parseInt(vertices.value, 10);
    if (isNaN(nvertices) || nvertices <= 0) {
        return false;
    }
    let table = document.getElementById(`innerTabla${tablaId}`);
    let r;
    clearElement(table);
    for (let i = 0; i < nvertices; i += 1) {
        r = table.insertRow();
        r.insertCell().appendChild(document.createTextNode(String(i)));
        r.insertCell().appendChild(newInputElement(`origenes${tablaId}`));
        r.insertCell().appendChild(newInputElement(`destinos${tablaId}`));
        r.insertCell().appendChild(newInputElement(`pesos${tablaId}`, "0.0"));
        if (nRows != null) {
            r.insertCell().appendChild(newInputElement(`probable${tablaId}`, "0.0"));
            r.insertCell().appendChild(newInputElement(`pesimista${tablaId}`, "0.0"));
        }
    }
    return true;
}
function flujoMaximo() {
    const tablaId = "Flujo";
    const tabla = document.getElementById(`Tabla${tablaId}`);
    if (!tabla.checkValidity()) {
        tabla.reportValidity();
        return;
    }
    const origen = document.getElementById("origen");
    const destino = document.getElementById("destino");
    const dirigido = document.getElementById("GrafoDirigido");
    let payload = {
        data: graphFromTable(tablaId),
        origen: origen.value.trim(),
        destino: destino.value.trim(),
        dirigido: dirigido.checked
    };
    postData('flujomaximo', payload).then(data => { renderResponseFlujo(data); });
}
function floydWarshall() {
    const tablaId = "Floyd";
    const tabla = document.getElementById(`Tabla${tablaId}`);
    if (!tabla.checkValidity()) {
        tabla.reportValidity();
        return;
    }
    postData('floydwarshall', graphFromTable(tablaId)).then(data => {
        renderResponseFloyd(data);
    });
}
function CPM() {
    const act = graphFromTable("CPM");
    if (act === undefined)
        return;
    postData("cpm", act).then(data => { renderResponseCPM(data); });
}
function PERT() {
    const act = graphFromTable("PERT");
    if (act === undefined)
        return;
    const probables = document.querySelectorAll(".probablePERT");
    const pesimistas = document.querySelectorAll(".pesimistaPERT");
    let actividaes = Array();
    for (const [idx, a] of act.entries()) {
        let probable = parseFloat(probables[idx].value.trim());
        let pesimista = parseFloat(pesimistas[idx].value.trim());
        if (isNaN(probable) || isNaN(probable)) {
            alert("Por favor verifica que los pesos ingresados sean números.");
            return;
        }
        let activida = {
            origen: a.origen,
            destino: a.destino,
            optimista: a.peso,
            probable: probable,
            pesimista: pesimista,
        };
        actividaes.push(activida);
    }
    postData("pert", actividaes).then(data => { renderResponsePERT(data); });
}
function graphFromTable(id) {
    const origenes = document.querySelectorAll(`.origenes${id}`);
    const destinos = document.querySelectorAll(`.destinos${id}`);
    const pesos = document.querySelectorAll(`.pesos${id}`);
    let peso = 0;
    let grafo = [];
    for (let idx = 0; idx < origenes.length; idx += 1) {
        peso = parseFloat(pesos[idx].value.trim());
        if (isNaN(peso)) {
            alert("Por favor verifica que los pesos ingresados sean números.");
            return;
        }
        grafo.push({
            origen: origenes[idx].value.trim(),
            destino: destinos[idx].value.trim(),
            peso: peso
        });
    }
    return grafo;
}
function fillTable(id, d, pert) {
    let origenes = document.querySelectorAll(`.origenes${id}`);
    let destinos = document.querySelectorAll(`.destinos${id}`);
    let pesos = document.querySelectorAll(`.pesos${id}`);
    let probables = document.querySelectorAll(`.probable${id}`);
    let pesimistas = document.querySelectorAll(`.pesimista${id}`);
    for (let idx = 0; idx < d.length; idx += 1) {
        origenes[idx].value = d[idx].origen;
        destinos[idx].value = d[idx].destino;
        if (!pert) {
            pesos[idx].value = String(d[idx].peso);
        }
        else {
            pesos[idx].value = String(d[idx].optimista);
            probables[idx].value = String(d[idx].probable);
            pesimistas[idx].value = String(d[idx].pesimista);
        }
    }
}
function drawGraphLink(nodes, camino, dirigido) {
    let link = "https://image-charts.com/chart?chof=.svg&chs=640x640&cht=gv&chl=";
    let sep;
    if (dirigido) {
        link += "digraph{rankdir=LR;";
        sep = "-%3E";
    }
    else {
        link += "graph{rankdir=LR;";
        sep = "--";
    }
    const s = setOfTrajectory(camino);
    for (const v of nodes) {
        if (s.has(`${v.origen}${v.destino}`)) {
            link += `${v.origen}${sep}${v.destino}[label=%22${v.peso}%22,color=red,penwidth=3.0];`;
        }
        else {
            link += `${v.origen}${sep}${v.destino}[label=%22${v.peso}%22];`;
        }
    }
    link += "}";
    return link;
}
function graphButton(id, link) {
    return `<button class="btn btn-primary" type="button"
  data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false"
  aria-controls="${id}">Visualizar</button>
  <div class="collapse" id="${id}"><br><br>
  <div class="card card-body" style="padding:0px;">
  <img src="${link}" width="640" height="640" class="center img-fluid" loading="lazy">
  </div>
  </div>`;
}
function setOfTrajectory(trajectory) {
    const t = new Set();
    const s = findStrip(trajectory, '|').split(",");
    for (let i = 0; i < s.length - 1; i += 1) {
        t.add(`${s[i]}${s[i + 1]}`);
    }
    return t;
}
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
    let response = `μ = ${r.media.toFixed(3)}, σ² = ${r.sumaVariazas.toFixed(3)}<br><br>`;
    response += `Probabilidad de que el proyecto termine en
  <input id="tiempoID" style="max-width:80px" type="text" class="form-control" placeholder="0.0">
  o menos unidades de tiempo:<b><p id="normalCDF"></p><br></b>`;
    response += `<button type="button" class="btn btn-primary" onclick="renderNormalCDF()">Calcular</button><br><br><br>`;
    response += `<br><img src="${drawGraphLinkCritical(r.cpm)}" width="999" height="360" class="center img-fluid"><br><br>`;
    document.getElementById("respuestasPERT").innerHTML = response;
    document.getElementById("normalCDF").scrollIntoView(true);
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
function drawGraphLinkCritical(r) {
    for (let a of r.actividades) {
        if (a.nombre === "-") {
            a.nombre = "Inicio";
        }
    }
    const rutaCritica = new Set(r.rutaCritica);
    rutaCritica.add("Inicio");
    let link = "https://image-charts.com/chart?chof=.svg&chs=999x999&cht=gv&chl=digraph{rankdir=LR;";
    for (const a of r.actividades) {
        for (const s of a.sucesores) {
            link += `${a.nombre}->${s}`;
            link += "[" + `label="${a.proximoL.toFixed(3)}, ${a.proximoR.toFixed(3)}\n${a.lejanoL.toFixed(3)}, ${a.lejanoR.toFixed(3)}"`;
            if (rutaCritica.has(a.nombre) && rutaCritica.has(s)) {
                link += ",color=red,penwidth=3.0]";
            }
            else {
                link += "]";
            }
            link += ";";
        }
    }
    link += "}";
    return encodeURI(link);
}
