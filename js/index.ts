interface ResponseFloydW {
  cambios: Array<Change>,
  iteraciones: Array<Array<Vertices>>,
  nodos: Array<string>,
}

interface ResponseFlujoMaximo {
  Flujo: number,
  Data: Array<Path>,
}

interface ResponseCPM {
  actividades: Array<Actividad>,
  rutaCritica: Array<string>,
  duracionTotal: number,
}

interface ResponsePERT {
  rutaCritica: Array<string>,
  estimaciones: Array<number>,
  varianzas: Array<number>,
  sumaVariazas: number,
  media: number,
}

interface Actividad {
  nombre: string,
  duracion: number,
  sucesores: Array<string>,
  proximoL: number,
  proximoR: number,
  lejanoL: number,
  lejanoR: number,
}

interface Path {
  data: Array<Vertices>,
  camino: string,
}

interface Vertices {
  origen: string,
  destino: string,
  peso: number,
}

interface VerticePERT {
  origen: string,
  destino: string,
  optimista: number,
  probable: number,
  pesimista: number,
}

interface Change {
  iteracion: number,
  origen: string,
  destino: string,
}

function showTable(tablaId: string, formId: string, verticesId: string) {
  const form = <HTMLFormElement>document.getElementById(formId);

  if (form.checkValidity()) {
    if (generateTable(tablaId, verticesId)) {
      document.getElementById(tablaId).style.setProperty("display", "block", 'important');
    } else {
      alert("Número de vértices NO valido.");
    }
  } else {
    form.reportValidity();
  }
}

function generateTable(tablaId: string, verticesId: string): boolean {
  const vertices = <HTMLInputElement>document.getElementById(verticesId);
  const nRows = <HTMLTableRowElement>document.getElementById(`${tablaId}Header`);
  const nvertices: number = parseInt(vertices.value, 10);

  if (isNaN(nvertices) || nvertices <= 0){
    return false;
  }

  let tabalaHtml = document.getElementById(`innerTabla${tablaId}`);
  tabalaHtml.innerHTML = "";

  let tabla: string = "";
  let i: number = 0;


  // #, origen, destino, peso
  for (; i < nvertices; i += 1) {
    tabla += `<tr><td>${i}</td><td><input type="text" class="form-control origenes${tablaId}" required></td>`;
    tabla += `<td><input type="text" class="form-control destinos${tablaId}" required></td>`;
    tabla += `<td><input type="text" class="form-control pesos${tablaId}" placeholder="0.0" required></td>`;

    if (nRows != null) {
      // Caso especial PERT
      tabla += `<td><input type="text" class="form-control probable${tablaId}" placeholder="0.0" required></td>`;
      tabla += `<td><input type="text" class="form-control pesimista${tablaId}" placeholder="0.0" required></td>`;
    }
    tabla += "</tr>";
  }

  tabalaHtml.insertAdjacentHTML("afterbegin", tabla);

  return true;
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
  const dirigido = <HTMLInputElement>document.getElementById("GrafoDirigido");

  let payload = {
    data: graphFromTable(tablaId),
    origen: origen.value.trim(),
    destino: destino.value.trim(),
    dirigido: dirigido.checked
  };

  postData('flujomaximo', payload)
  .then(data => {
    renderResponseFlujo(data);
  });
}

function floydWarshall() {
  const tablaId: string = "Floyd";
  const tabla = <HTMLFormElement>document.getElementById(`Tabla${tablaId}`);

  if (!tabla.checkValidity()) {
    tabla.reportValidity();
    return;
  }

  postData('floydwarshall', graphFromTable(tablaId))
  .then(data => {
    renderResponseFloyd(data);
  });
}

// Critical Path Method
function CPM() {
  const act = graphFromTable("CPM");

  if (act === undefined) return;

  postData("cpm", act)
  .then(data => {
    renderResponseCPM(data)
  });
}

// Critical Path, PERT
function PERT() {
  const act = graphFromTable("PERT");

  if (act === undefined) return;

  const probables = document.querySelectorAll<HTMLInputElement>(".probablePERT");
  const pesimistas = document.querySelectorAll<HTMLInputElement>(".pesimistaPERT");

  let actividaes: Array<VerticePERT> = Array();
  let idx = 0;

  for (const a of act) {
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

    idx += 1;
  }

  postData("pert", actividaes)
  .then(data => {
    renderResponsePERT(data)
  });
}

function graphFromTable(id: string): Array<Vertices> {
  const origenes = document.querySelectorAll<HTMLInputElement>(`.origenes${id}`);
  const destinos = document.querySelectorAll<HTMLInputElement>(`.destinos${id}`);
  const pesos = document.querySelectorAll<HTMLInputElement>(`.pesos${id}`);

  let peso: number = 0;
  let grafo = []

  for (let idx = 0; idx < origenes.length; idx += 1) {
    peso = parseFloat(pesos[idx].value.trim());

    if (isNaN(peso)) {
      alert("Por favor verifica que los pesos ingresados sean números.")
      return;
    }

    grafo.push({
      origen: origenes[idx].value.trim(),
      destino: destinos[idx].value.trim(),
      peso: peso
    });
  }

  return grafo
}

// From MDN, https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options
async function postData(url: string, data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });

  return response.json();
}

function drawGraphLink(nodes: Array<Vertices>, camino: string, dirigido: boolean) {
  // Documentación: https://documentation.image-charts.com/graph-viz-charts/
  let link: string = "https://image-charts.com/chart?chof=.svg&chs=640x640&cht=gv&chl=";
  let sep: string;
  if (dirigido) {
    link += "digraph{rankdir=LR;";
    sep = "-%3E";
  } else {
    link += "graph{rankdir=LR;";
    sep = "--";
  }

  const s = setOfTrajectory(camino);

  for (const v of nodes) {
    if (s.has(`${v.origen}${v.destino}`)) {
      // Fue parte de la trayectoria que se tomó
      link += `${v.origen}${sep}${v.destino}[label=%22${v.peso}%22,color=red,penwidth=3.0];`;
    } else {
      link += `${v.origen}${sep}${v.destino}[label=%22${v.peso}%22];`;
    }
  }

  link += "}";

  return link;
}

function graphButton(id: string, link: string) :string {
  return `<button class="btn btn-primary" type="button"
  data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false"
  aria-controls="${id}">
  Visualizar</button>
  <div class="collapse" id="${id}"><br><br>
  <div class="card card-body" style="padding:0px;">
  <img src="${link}" width="640" height="640" class="center img-fluid" loading="lazy"></div></div>`;
}

function setOfTrajectory(trajectory: string): Set<string> {
  const t: Set<string>=  new Set();
  const s = findStrip(trajectory, '|').split(",");

  for(let i = 0; i < s.length - 1; i += 1) {
    t.add(`${s[i]}${s[i+1]}`);
  }

  return t;
}

function findStrip(str: string, neddle: string): string {
  //busca needle y quita todo lo que este después de este, incluyendo a este
  //si no se encuentra, regresa el str intacto
  const idx = str.indexOf(neddle);
  if (idx === -1) {
    return str;
  } else {
    return str.slice(0, idx);
  }
}

function renderResponsePERT(r: ResponsePERT) {
  let header = <HTMLTableElement>document.getElementById("PERTHeader");
  header.insertAdjacentHTML("beforeend", '<th scope="col">Duración Estimada</th><th scope="col">Varianza</th>');

  let table = <HTMLTableElement>document.getElementById("innerTablaPERT");
  let idx = 0;
  let newColumns: string;

  for (let row of table.rows) {
    newColumns = `<td>${r.estimaciones[idx]}</td><td>${r.varianzas[idx]}</td>`;
    row.insertAdjacentHTML("beforeend", newColumns);
    idx += 1;
  }

  // TODO limpiar antes de asignar
  document.getElementById("TablaPERT")
  .insertAdjacentHTML("beforeend",`μ = ${r.media}, σ² = ${r.sumaVariazas}<br><br><br>`);
}

function renderResponseFlujo(r: ResponseFlujoMaximo) {
  let respuesta = document.getElementById("respuestaFlujo");
  const dirigido = <HTMLInputElement>document.getElementById("GrafoDirigido");

  let respHTML: string = `<p>Flujo Máximo: ${r.Flujo}</p><br>
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
  respHTML += "</tbody></table>"

  respuesta.innerHTML = "";
  respuesta.insertAdjacentHTML("afterbegin", respHTML);
  respuesta.style.setProperty("display", "block", 'important');
}

function renderResponseFloyd(r: ResponseFloydW) {
  const cambios = new Set();

  for (const cambio of r.cambios) {
    cambios.add(JSON.stringify(cambio));
  }

  let nodesHeader: string = "";
  for (const n of r.nodos) {
    nodesHeader += `<td style="font-weight:bold;">${n}</td>`
  }

  let respHTML: string = '<table class="table table-hover">';
  let idx = 0;

  // TODO menos complejo, menos loops
  for (const iteracion of r.iteraciones) {
    respHTML += `<thead><tr><td class="table-primary">Iteración ${idx}</td>${nodesHeader}<tr></thead>`;

    for (const a of r.nodos) {
      respHTML += `<tr><td class="table_nodes"">${a}</td>`;

      for (const b of r.nodos) {
        for (const n of iteracion) {

          if (n.origen == a && n.destino == b) {
            const c = JSON.stringify({iteracion:idx, origen: a, destino: b});

            if (cambios.has(c)) {
              // es un cambio
              respHTML += '<td class="cambio">';
            } else {
              respHTML += '<td>';
            }

            if (n.peso == Number.MAX_VALUE) {
              respHTML += '∞';
            } else {
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


function renderResponseCPM(r: ResponseCPM) {
  const rutaCritica: Set<string> = new Set(r.rutaCritica);
  let respHTML = `<br><p>Duración Total: ${r.duracionTotal}</p><br>`;
  let link = "https://image-charts.com/chart?chof=.svg&chs=999x999&cht=gv&chl=graph{rankdir=LR;";

  for (const a of r.actividades) {
    if (a.nombre === "-") {
      // TODO evitar esto
      link += `Inicio--{`;
      } else {
        link += `${a.nombre}--{`;
        }

        for (const s of a.sucesores){
          link += `${s} `;
        }
        link +="}";

        link += `[label="${a.proximoL}, ${a.proximoR}\n${a.lejanoL}, ${a.lejanoR}"`;

          if (rutaCritica.has(a.nombre)) {
            link +=",color=red,penwidth=3.0]";
          } else {
            link +="]";
          }

          link +=";";
      }
      link += "}";
      link = encodeURI(link);

      respHTML += `<img src="${link}" width="999" height="360" class="center img-fluid"><br><br>`;

      let respuesta = document.getElementById("respuestaCPM");
      respuesta.innerHTML = "";
      respuesta.insertAdjacentHTML("afterbegin", respHTML);
      respuesta.style.setProperty("display", "block", 'important');
    }
