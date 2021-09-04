"use strict";
var Method;
(function (Method) {
    Method[Method["FlujoMaximo"] = 0] = "FlujoMaximo";
    Method[Method["FloydWarshall"] = 1] = "FloydWarshall";
    Method[Method["CPM"] = 2] = "CPM";
    Method[Method["PERT"] = 3] = "PERT";
    Method[Method["Aceleracion"] = 4] = "Aceleracion";
    Method[Method["Dijkstra"] = 5] = "Dijkstra";
    Method[Method["Kruskal"] = 6] = "Kruskal";
    Method[Method["None"] = 7] = "None";
})(Method || (Method = {}));
var varianza = 0;
var media = 0;
const tabs = document.querySelectorAll('.nav-link');
var activeTab = Method.FlujoMaximo;
const form = document.getElementById("generalForm");
const vertices = document.getElementById("generalNvertices");
function showTable() {
    if (form.checkValidity()) {
        const method = Method[activeTab];
        const nvertices = parseInt(vertices.value, 10);
        if (isNaN(nvertices) || nvertices <= 0) {
            alert("Número de vértices NO valido.");
        }
        else {
            generateTable(method, nvertices);
            document.getElementById(method).style.setProperty("display", "block");
        }
    }
    else {
        form.reportValidity();
    }
}
function generateTable(tableId, nvertices) {
    const nRows = document.getElementById(`${tableId}Header`);
    let table = document.getElementById(`innerTable${tableId}`);
    let r;
    clearElement(table);
    for (let i = 0; i < nvertices; i += 1) {
        r = table.insertRow();
        r.insertCell().appendChild(document.createTextNode(String(i)));
        r.insertCell().appendChild(newInputElement(`origenes${tableId}`));
        r.insertCell().appendChild(newInputElement(`destinos${tableId}`));
        r.insertCell().appendChild(newInputElement(`pesos${tableId}`, "0.0"));
        if (nRows != null) {
            if (tableId === "PERT") {
                r.insertCell().appendChild(newInputElement(`probable${tableId}`, "0.0"));
                r.insertCell().appendChild(newInputElement(`pesimista${tableId}`, "0.0"));
            }
            else {
                r.insertCell().appendChild(newInputElement(`costo${tableId}`, "0.0"));
                r.insertCell().appendChild(newInputElement(`pesosUrgente${tableId}`, "0.0"));
                r.insertCell().appendChild(newInputElement(`costosUrgente${tableId}`, "0.0"));
            }
        }
    }
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
    let payload = {
        data: graphFromTable(tablaId),
        origen: origen.value.trim(),
        destino: destino.value.trim(),
        dirigido: true,
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
    const act = graphFromTable("Aceleracion");
    if (act === undefined)
        return;
    const costos = document.querySelectorAll(".costoAceleracion");
    const pesosUrgentes = document.querySelectorAll(".pesosUrgenteAceleracion");
    const costosUrgentes = document.querySelectorAll(".costosUrgenteAceleracion");
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
        if (id === "Aceleracion") {
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
    let link = "";
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
function graphButton(id) {
    return `<button class="btn btn-primary" type="button"
data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false"
aria-controls="${id}">Visualizar</button>
<div class="collapse" id="${id}"><br><br>
<div class="card card-body" style="padding:0px;">
<div id="imagen${id}" style="text-align: center;" class="center img-fluid">
    </div></div>`;
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
    let link = "digraph{rankdir=LR;";
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
    return link;
}
tabs.forEach(tab => {
    tab.addEventListener('shown.bs.tab', event => {
        form.style.setProperty("display", "block");
        const tab = event.target;
        switch (tab.id) {
            case "flujo-tab":
                activeTab = Method.FlujoMaximo;
                break;
            case "floyd-tab":
                activeTab = Method.FloydWarshall;
                break;
            case "cpm-tab":
                activeTab = Method.CPM;
                break;
            case "pert-tab":
                activeTab = Method.PERT;
                break;
            case "acelaracion-tab":
                activeTab = Method.Aceleracion;
                break;
            case "dijkstra-tab":
                activeTab = Method.Dijkstra;
                break;
            case "kruskal-tab":
                activeTab = Method.Kruskal;
                break;
            default:
                form.style.setProperty("display", "none");
                activeTab = Method.None;
        }
    });
});
