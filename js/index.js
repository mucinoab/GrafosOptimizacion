function MostartTabla(tablaId, formId, verticesId) {
    const form = document.getElementById(formId);
    if (form.checkValidity()) {
        if (GeneraTabla(tablaId, verticesId)) {
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
function GeneraTabla(tablaId, verticesId) {
    const vertices = document.getElementById(verticesId);
    const nvertices = parseInt(vertices.value, 10);
    if (isNaN(nvertices) || nvertices <= 0) {
        return false;
    }
    let tabalaHtml = document.getElementById(`innerTabla${tablaId}`);
    tabalaHtml.innerHTML = "";
    let tabla = "";
    let i = 0;
    for (; i < nvertices; i += 1) {
        tabla += `<tr><td>${i}</td><td><input type="text" class="form-control origenes${tablaId}" required></td>`;
        tabla += `<td><input type="text" class="form-control destinos${tablaId}" required></td>`;
        tabla += `<td><input type="text" class="form-control pesos${tablaId}" placeholder="0.0" required></td></tr>`;
    }
    tabalaHtml.insertAdjacentHTML("afterbegin", tabla);
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
        data: grafoDeTabla(tablaId),
        origen: origen.value.trim(),
        destino: destino.value.trim(),
        dirigido: dirigido.checked
    };
    console.log(JSON.stringify(payload));
    postData('flujomaximo', payload)
        .then(data => {
        renderResponseFlujo(data);
    });
}
function floydWarshall() {
    const tablaId = "Floyd";
    const tabla = document.getElementById(`Tabla${tablaId}`);
    if (!tabla.checkValidity()) {
        tabla.reportValidity();
        return;
    }
    postData('floydwarshall', grafoDeTabla(tablaId))
        .then(data => {
        renderResponseFloyd(data);
    });
}
function grafoDeTabla(id) {
    const origenes = document.querySelectorAll(`.origenes${id}`);
    const destinos = document.querySelectorAll(`.destinos${id}`);
    const pesos = document.querySelectorAll(`.pesos${id}`);
    let idx = 0;
    let peso = 0;
    let grafo = [];
    for (; idx < origenes.length; idx += 1) {
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
async function postData(url, data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response.json();
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
    respuesta.innerHTML = "";
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
    let respHTML = '<table class="table table-hover">';
    let idx = 0;
    for (const iteracion of r.iteraciones) {
        respHTML += `<thead><tr><td class="table-primary">Iteración ${idx}</td>${nodesHeader}<tr></thead>`;
        for (const a of r.nodos) {
            respHTML += `<tr><td class="table_nodes"">${a}</td>`;
            for (const b of r.nodos) {
                for (const n of iteracion) {
                    if (n.origen == a && n.destino == b) {
                        const c = JSON.stringify({ iteracion: idx, origen: a, destino: b });
                        if (cambios.has(c)) {
                            respHTML += '<td class="cambio">';
                        }
                        else {
                            respHTML += '<td>';
                        }
                        if (n.peso == Number.MAX_VALUE) {
                            respHTML += '∞';
                        }
                        else {
                            respHTML += n.peso;
                        }
                        respHTML += "</td>";
                        break;
                    }
                }
            }
            respHTML += "</tr>";
        }
        idx += 1;
    }
    respHTML = respHTML.replace("Iteración 0", "Grafo Inicial");
    let respuesta = document.getElementById("respuestaFloyd");
    respuesta.innerHTML = " ";
    respuesta.insertAdjacentHTML("afterbegin", respHTML);
    respuesta.style.setProperty("display", "block", 'important');
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
    link += "}#";
    return link;
}
function graphButton(id, link) {
    return `<button class="btn btn-primary" type="button"
  data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false"
  aria-controls="${id}">
  Visualizar</button>
  <div class="collapse" id="${id}"><br><br>
  <div class="card card-body" style="padding: 0px;">
  <img src="${link}" width="640" height="640" class="center img-fluid" loading="lazy"></div></div>`;
}
function setOfTrajectory(trajectory) {
    const t = new Set();
    const s = find_strip(trajectory, '|').split(",");
    for (let i = 0; i < s.length - 1; i += 1) {
        t.add(`${s[i]}${s[i + 1]}`);
    }
    return t;
}
function find_strip(str, neddle) {
    const idx = str.indexOf(neddle);
    if (idx === -1) {
        return str;
    }
    else {
        return str.slice(0, idx);
    }
}
function ejemploFlujo() {
    const ejemplo = { "data": [{ "origen": "Bilbao", "destino": "S1", "peso": 4 }, { "origen": "Bilbao", "destino": "S2", "peso": 1 }, { "origen": "Barcelona", "destino": "S1", "peso": 2 }, { "origen": "Barcelona", "destino": "S2", "peso": 3 }, { "origen": "Sevilla", "destino": "S1", "peso": 2 }, { "origen": "Sevilla", "destino": "S2", "peso": 2 }, { "origen": "Sevilla", "destino": "S3", "peso": 3 }, { "origen": "Valencia", "destino": "S2", "peso": 2 }, { "origen": "Zaragoza", "destino": "S2", "peso": 3 }, { "origen": "Zaragoza", "destino": "S3", "peso": 1 }, { "origen": "Origen", "destino": "Bilbao", "peso": 7 }, { "origen": "Origen", "destino": "Barcelona", "peso": 5 }, { "origen": "Origen", "destino": "Sevilla", "peso": 7 }, { "origen": "Origen", "destino": "Zaragoza", "peso": 6 }, { "origen": "Origen", "destino": "Valencia", "peso": 2 }, { "origen": "S1", "destino": "Madrid", "peso": 8 }, { "origen": "S2", "destino": "Madrid", "peso": 8 }, { "origen": "S3", "destino": "Madrid", "peso": 8 }], "origen": "Origen", "destino": "Madrid", "dirigido": true };
    postData('flujomaximo', ejemplo).then(data => { renderResponseFlujo(data); });
}
function ejemploFloyd() {
    const ejemplo = [{ "origen": "1", "destino": "2", "peso": 700 }, { "origen": "1", "destino": "3", "peso": 200 }, { "origen": "2", "destino": "3", "peso": 300 }, { "origen": "2", "destino": "4", "peso": 200 }, { "origen": "2", "destino": "6", "peso": 400 }, { "origen": "3", "destino": "4", "peso": 700 }, { "origen": "3", "destino": "5", "peso": 600 }, { "origen": "4", "destino": "6", "peso": 100 }, { "origen": "4", "destino": "5", "peso": 300 }, { "origen": "6", "destino": "5", "peso": 500 }];
    postData('floydwarshall', ejemplo).then(data => { renderResponseFloyd(data); });
}
