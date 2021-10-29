enum Method {
  FlujoMaximo,
  FloydWarshall,
  CPM,
  PERT,
  Aceleracion,
  Dijkstra,
  Kruskal,
  None
}

// TODO
// Globals
var varianza: number = 0;
var media: number = 0;

// Id of the Kruskal animation
var KruskalTimeOut: number;

const tabs = document.querySelectorAll('.nav-link');
var activeTab: Method = Method.FlujoMaximo;

const form = <HTMLFormElement>document.getElementById("generalForm");
const vertices = <HTMLInputElement>document.getElementById("generalNvertices");

// @ts-ignore
const graphWasm = window["@hpcc-js/wasm"];

// Draw graph stuff
const graphInput = <HTMLTextAreaElement>document.getElementById("graphInput");
renderDotGraph("drawContainer", `digraph{rankdir=LR;${graphInput.value}}`);
graphInput.addEventListener("input", debounce(() => {
  const dotGraph = `digraph{rankdir=LR;${graphInput.value}}`;
  renderDotGraph("drawContainer", dotGraph);
}, 400));

function showTable() {
  if (form.checkValidity()) {
    const method = Method[activeTab];
    const nvertices = parseInt(vertices.value, 10);

    if (isNaN(nvertices) || nvertices <= 0) {
      alert("Número de vértices NO valido.");
    } else {
      generateTable(method, nvertices);
      document.getElementById(method).style.setProperty("display", "block");
    }
  } else {
    form.reportValidity();
  }
}

function generateTable(tableId: string, nvertices: number): void {
  const nRows = document.getElementById(`${tableId}Header`) != null;
  let table = <HTMLTableElement>document.getElementById(`innerTable${tableId}`);

  clearElement(table);

  for (let i = 0; i < nvertices; i += 1) {
    appendRow(table, tableId, i, nRows);
  }
}

function flujoMaximo() {
  const tablaId: string = "Flujo"
  const tabla = <HTMLFormElement>document.getElementById(`Tabla${tablaId}`);

  if (!tabla.checkValidity()) {
    tabla.reportValidity();
    return;
  }

  const origen = <HTMLInputElement>document.getElementById("origen");
  const destino = <HTMLInputElement>document.getElementById("destino");

  let payload = {
    data: graphFromTable(tablaId),
    origen: origen.value.trim(),
    destino: destino.value.trim(),
    dirigido: true, // HACK, for now
  };

  postData('flujomaximo', payload).then(data => {renderResponseFlujo(data)});
}

function floydWarshall() {
  const tabla = <HTMLFormElement>document.getElementById(`TablaFloyd`);

  if (!tabla.checkValidity()) {
    tabla.reportValidity();
    return;
  }

  postData('floydwarshall', graphFromTable("FloydWarshall")).then(data => {
    renderResponseFloyd(data);
  });
}

// Critical Path Method
function CPM() {
  const act = graphFromTable("CPM");

  if (act === undefined) return;

  postData("cpm", act).then(data => {renderResponseCPM(data)});
}

// Critical Path, PERT
function PERT() {
  const act = graphFromTable("PERT");

  if (act === undefined) return;

  const probables = document.querySelectorAll<HTMLInputElement>(".probablePERT");
  const pesimistas = document.querySelectorAll<HTMLInputElement>(".pesimistaPERT");

  let actividaes: Array<VerticePERT> = Array();

  for (const [idx, a] of act.entries()) {
    let probable = parseFloat(probables[idx].value.trim());
    let pesimista = parseFloat(pesimistas[idx].value.trim());

    if (isNaN(probable) || isNaN(probable)) {
      alert("Por favor verifica que los pesos ingresados sean números.")
      return;
    }

    let activida: VerticePERT = {
      origen: a.origen,
      destino: a.destino,
      optimista: a.peso,
      probable: probable,
      pesimista: pesimista,
    };

    actividaes.push(activida);
  }

  postData("pert", actividaes).then(data => {renderResponsePERT(data)});
}

function Compresion() {
  const act = graphFromTable("Aceleracion");

  if (act === undefined) return;

  const costos = document.querySelectorAll<HTMLInputElement>(".costoAceleracion");
  const pesosUrgentes = document.querySelectorAll<HTMLInputElement>(".pesosUrgenteAceleracion");
  const costosUrgentes = document.querySelectorAll<HTMLInputElement>(".costosUrgenteAceleracion");

  let actividades: Array<VerticeCompresion> = Array();

  for (const [idx, a] of act.entries()) {
    const costoN = parseFloat(costos[idx].value.trim());
    const pUrgente = parseFloat(pesosUrgentes[idx].value.trim());
    const cUrgente = parseFloat(costosUrgentes[idx].value.trim());

    if (isNaN(costoN) || isNaN(pUrgente) || isNaN(cUrgente)) {
      alert("Por favor verifica que los pesos ingresados sean números.")
      return;
    }

    let activida: VerticeCompresion = {
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
      alert("Por favor verifica que la duración objetivo sea un número válido.")
      return;
    }
  }

  const data: CompresionData = {
    actividades: actividades,
    tiempoObjetivo: duracion,
  };

  postData("compresion", data).then(data => {renderResponseCompresion(data)});
}

function Dijkstra() {
  const form = <HTMLFormElement>document.getElementById("TablaDijkstra");

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const act = graphFromTable("Dijkstra");
  const origen = <HTMLInputElement>document.getElementById(`OrigenDijkstra`);
  const destino = <HTMLInputElement>document.getElementById(`DestinoDijkstra`);

  postData('dijkstra', {
    grafo: act,
    origen: origen.value.trim(),
    destino: destino.value.trim(),
  }).then(data => renderResponseDijkstra(data));
}

function Kruskal() {
  postData("kruskal", graphFromTable("Kruskal")).then(data => {
    renderResponseKruskal(data)
  });
}

function graphFromTable(id: string): Array<Vertices> {
  const origenes = document.querySelectorAll<HTMLInputElement>(`.origenes${id}`);
  const destinos = document.querySelectorAll<HTMLInputElement>(`.destinos${id}`);
  const pesos = document.querySelectorAll<HTMLInputElement>(`.pesos${id}`);

  let peso: number = 0;
  let origen: string;
  let destino: string;
  let grafo = []

  for (let idx = 0; idx < origenes.length; idx += 1) {
    origen = origenes[idx].value.trim();
    peso = parseFloat(pesos[idx].value.trim());
    destino = destinos[idx].value.trim();

    if (isNaN(peso)) {
      alert("Por favor verifica que los pesos ingresados sean números.")
      return;
    }

    if (!origen || origen.length === 0 || !destino || destino.length === 0) {
      alert("Por favor llena todos los orígenes/destinos.")
      return;
    }

    grafo.push({
      origen: origen,
      destino: destino,
      peso: peso
    });
  }

  return grafo
}

function fillTable(id: string, d: Array<any>) {
  let origenes = document.querySelectorAll<HTMLInputElement>(`.origenes${id}`);
  let destinos = document.querySelectorAll<HTMLInputElement>(`.destinos${id}`);
  let pesos = document.querySelectorAll<HTMLInputElement>(`.pesos${id}`);
  let probables = document.querySelectorAll<HTMLInputElement>(`.probable${id}`);
  let pesimistas = document.querySelectorAll<HTMLInputElement>(`.pesimista${id}`);

  let costos = document.querySelectorAll<HTMLInputElement>(`.costo${id}`);
  let pesosU = document.querySelectorAll<HTMLInputElement>(`.pesosUrgente${id}`);
  let costosU = document.querySelectorAll<HTMLInputElement>(`.costosUrgente${id}`);

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
    } else if (id === "PERT") {
      pesos[idx].value = String(d[idx].optimista);
      probables[idx].value = String(d[idx].probable);
      pesimistas[idx].value = String(d[idx].pesimista);
    } else {
      pesos[idx].value = String(d[idx].peso);
    }
  }
}

function createGraph(nodes: Array<Vertices>, camino: string, dirigido: boolean): string {
  let graph = "";

  let sep: string;
  if (dirigido) {
    graph += "digraph{rankdir=LR;";
    sep = "->";
  } else {
    graph += "graph{rankdir=LR;";
    sep = "--";
  }

  const s = setOfTrajectory(camino);

  for (const v of nodes) {
    if (s.has(`${v.origen}${v.destino}`)) {
      // Fue parte de la trayectoria que se tomó
      graph += `${v.origen}${sep}${v.destino}[label=\"${v.peso}\",color=red,penwidth=3.0];`;
    } else {
      graph += `${v.origen}${sep}${v.destino}[label=\"${v.peso}\"];`;
    }
  }

  return graph + '}';
}

function graphButton(id: string): string {
  return `<button class="btn btn-primary" type="button"
      data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false"
      aria-controls="${id}">Visualizar</button>
        <div class="collapse" id="${id}"><br><br>
          <div class="card card-body" style="padding:0px;">
          <div id="imagen${id}" class="grafo-svg">
    </div></div>`;
}

function setOfTrajectory(trajectory: string): Set<string> {
  const t: Set<string>=  new Set();
  const s = findStrip(trajectory, '|').split(",");

  for(let i = 0; i < s.length - 1; i += 1) {
    t.add(`${s[i]}${s[i+1]}`);
  }

  return t;
}

function drawGraphLinkCritical(r: ResponseCPM): string {
  for (let a of r.actividades) {
    if (a.nombre === "-") {
      a.nombre = "Inicio";
    }
  }

  const rutaCritica: Set<string> = new Set(r.rutaCritica);
  rutaCritica.add("Inicio");

  let link = "digraph{rankdir=LR;";

  for (const a of r.actividades) {
    for (const s of a.sucesores){
      link += `${a.nombre}->${s}`;
      link += "[" + `label="${a.proximoL.toFixed(3)}, ${a.proximoR.toFixed(3)}\n${a.lejanoL.toFixed(3)}, ${a.lejanoR.toFixed(3)}"`;

      if (rutaCritica.has(a.nombre) &&  rutaCritica.has(s)) {
        link +=",color=red,penwidth=3.0]";
      } else {
        link +="]";
      }
      link +=";";
    }
  }

  link += "}";

  return link;
}

// This the way we signal in which tab are we in currently.
tabs.forEach(tab => {
  tab.addEventListener('shown.bs.tab', event => {
    form.style.setProperty("display", "block");
    const tab = <HTMLElement>event.target;

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
  })
});
