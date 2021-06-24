var varianza = 0;
var media = 0;
var slideIndex = 0;
var kruskalInterval = -1;
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
            if (tablaId === "PERT") {
                r.insertCell().appendChild(newInputElement(`probable${tablaId}`, "0.0"));
                r.insertCell().appendChild(newInputElement(`pesimista${tablaId}`, "0.0"));
            }
            else {
                r.insertCell().appendChild(newInputElement(`costo${tablaId}`, "0.0"));
                r.insertCell().appendChild(newInputElement(`pesosUrgente${tablaId}`, "0.0"));
                r.insertCell().appendChild(newInputElement(`costosUrgente${tablaId}`, "0.0"));
            }
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
function Compresion() {
    const act = graphFromTable("Compresion");
    if (act === undefined)
        return;
    const costos = document.querySelectorAll(".costoCompresion");
    const pesosUrgentes = document.querySelectorAll(".pesosUrgenteCompresion");
    const costosUrgentes = document.querySelectorAll(".costosUrgenteCompresion");
    let actividades = Array();
    for (const [idx, a] of act.entries()) {
        const costoN = parseFloat(costos[idx].value.trim());
        const pUrgente = parseFloat(pesosUrgentes[idx].value.trim());
        const cUrgente = parseFloat(costosUrgentes[idx].value.trim());
        if (isNaN(costoN) || isNaN(pUrgente) || isNaN(cUrgente)) {
            alert("Por favor verifica que los pesos ingresados sean números.");
            return;
        }
        let activida = {
            actividad: a.origen,
            predecesora: a.destino,
            pesoNormal: a.peso,
            costoNormal: costoN,
            pesoUrgente: pUrgente,
            costoUrgente: cUrgente,
        };
        actividades.push(activida);
    }
    const duracionObjetivo = "-100";
    let duracion = 0;
    if (duracionObjetivo.length != 0) {
        duracion = parseFloat(duracionObjetivo);
        if (isNaN(duracion)) {
            alert("Por favor verifica que la duración objetivo sea un número válido.");
            return;
        }
    }
    const data = {
        actividades: actividades,
        tiempoObjetivo: duracion,
    };
    postData("compresion", data).then(data => { renderResponseCompresion(data); });
}
function swapValues(data) {
    for (let row = 0; row < data.length; row++) {
        for (let col = row + 1; col < data[0].length; col++) {
            let tmp = data[col][row];
            data[col][row] = data[row][col];
            data[row][col] = tmp;
        }
    }
    return data;
}
function Dijkstra() {
    const form = document.getElementById("TablaDijkstra");
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    const act = graphFromTable("Dijkstra");
    const origen = document.getElementById(`OrigenDijkstra`);
    const destino = document.getElementById(`DestinoDijkstra`);
    postData('dijkstra', {
        grafo: act,
        origen: origen.value.trim(),
        destino: destino.value.trim(),
    }).then(data => renderResponseDijkstra(data));
}
function Kruskal() {
    postData("kruskal", graphFromTable("Kruskal")).then(data => {
        renderResponseKruskal(data);
    });
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
function fillTable(id, d) {
    let origenes = document.querySelectorAll(`.origenes${id}`);
    let destinos = document.querySelectorAll(`.destinos${id}`);
    let pesos = document.querySelectorAll(`.pesos${id}`);
    let probables = document.querySelectorAll(`.probable${id}`);
    let pesimistas = document.querySelectorAll(`.pesimista${id}`);
    let costos = document.querySelectorAll(`.costo${id}`);
    let pesosU = document.querySelectorAll(`.pesosUrgente${id}`);
    let costosU = document.querySelectorAll(`.costosUrgente${id}`);
    for (let idx = 0; idx < d.length; idx += 1) {
        origenes[idx].value = d[idx].origen;
        destinos[idx].value = d[idx].destino;
        if (id === "Compresion") {
            origenes[idx].value = d[idx].actividad;
            destinos[idx].value = d[idx].predecesora;
            pesos[idx].value = String(d[idx].pesoNormal);
            costos[idx].value = String(d[idx].costoNormal);
            pesosU[idx].value = String(d[idx].pesoUrgente);
            costosU[idx].value = String(d[idx].costoUrgente);
        }
        else if (id === "PERT") {
            pesos[idx].value = String(d[idx].optimista);
            probables[idx].value = String(d[idx].probable);
            pesimistas[idx].value = String(d[idx].pesimista);
        }
        else {
            pesos[idx].value = String(d[idx].peso);
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
function colorear(coors, row, col) {
    for (const cord of coors) {
        if (cord.row === row && cord.col === col)
            return true;
    }
    return false;
}
