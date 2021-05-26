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
    tabla += `<td><input type="text" class="form-control pesos${tablaId}" placeholder="0.0" required></td></tr>`;
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

//Critical Path Method
function CPM() {
  const act = graphFromTable("CPM");

  if (act === undefined) return;

  postData("cpm", act)
  .then(data => {
    renderResponseCPM(data)
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

    function ejemploFlujo() {
      const ejemplo =  {"data":[{"origen":"Bilbao","destino":"S1","peso":4},{"origen":"Bilbao","destino":"S2","peso":1},{"origen":"Barcelona","destino":"S1","peso":2},{"origen":"Barcelona","destino":"S2","peso":3},{"origen":"Sevilla","destino":"S1","peso":2},{"origen":"Sevilla","destino":"S2","peso":2},{"origen":"Sevilla","destino":"S3","peso":3},{"origen":"Valencia","destino":"S2","peso":2},{"origen":"Zaragoza","destino":"S2","peso":3},{"origen":"Zaragoza","destino":"S3","peso":1},{"origen":"Origen","destino":"Bilbao","peso":7},{"origen":"Origen","destino":"Barcelona","peso":5},{"origen":"Origen","destino":"Sevilla","peso":7},{"origen":"Origen","destino":"Zaragoza","peso":6},{"origen":"Origen","destino":"Valencia","peso":2},{"origen":"S1","destino":"Madrid","peso":8},{"origen":"S2","destino":"Madrid","peso":8},{"origen":"S3","destino":"Madrid","peso":8}],"origen":"Origen","destino":"Madrid","dirigido":true};
      postData('flujomaximo', ejemplo).then(data => {renderResponseFlujo(data);});
      }

      function ejemploFloyd() {
      const ejemplo = [{"origen":"1","destino":"2","peso":700}, {"origen":"1","destino":"3","peso":200},{"origen":"2","destino":"3","peso":300},{"origen":"2","destino":"4","peso":200},{"origen":"2","destino":"6","peso":400},{"origen":"3","destino":"4","peso":700},{"origen":"3","destino":"5","peso":600},{"origen":"4","destino":"6","peso":100},{"origen":"4","destino":"5","peso":300},{"origen":"6","destino":"5","peso":500}];
      postData('floydwarshall', ejemplo).then(data => {renderResponseFloyd(data);});
      }

      function ejemploCPM() {
      const ejemplo = [{"origen":"A","destino":"-","peso":2},{"origen":"B","destino":"A","peso":4},{"origen":"C","destino":"B","peso":1},{"origen":"C","destino":"H","peso":1},{"origen":"D","destino":"-","peso":6},{"origen":"E","destino":"G","peso":3},{"origen":"F","destino":"E","peso":5},{"origen":"G","destino":"D","peso":2},{"origen":"H","destino":"G","peso":2},{"origen":"I","destino":"D","peso":3},{"origen":"J","destino":"I","peso":4},{"origen":"K","destino":"D","peso":3},{"origen":"L","destino":"J","peso":5},{"origen":"L","destino":"K","peso":5},{"origen":"M","destino":"C","peso":2},{"origen":"M","destino":"L","peso":2}];
      postData('cpm', ejemplo).then(data => {renderResponseCPM(data);});
    }


