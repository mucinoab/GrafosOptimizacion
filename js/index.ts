function MostartTabla(tablaId: string, formId: string, verticesId: string) {
  const form = <HTMLFormElement>document.getElementById(formId);

  if (form.checkValidity()) {
    if (GeneraTabla(tablaId, verticesId)) {
      document.getElementById(tablaId).style.setProperty("display", "block", 'important');
    } else {
      alert("Número de vértices NO valido.");
    }
  } else {
    form.reportValidity();
  }
}

function GeneraTabla(tablaId: string, verticesId: string): boolean {
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
    data: grafoDeTabla(tablaId),
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

  let payload = grafoDeTabla(tablaId);
  console.log(payload);

  postData('floydwarshall', payload)
  .then(data => {
    renderResponseFlujo(data);
  });
}

function grafoDeTabla(id: string): any {
  const origenes = document.querySelectorAll<HTMLInputElement>(`.origenes${id}`);
  const destinos = document.querySelectorAll<HTMLInputElement>(`.destinos${id}`);
  const pesos = document.querySelectorAll<HTMLInputElement>(`.pesos${id}`);
  console.log(origenes)

  let idx: number = 0;
  let peso: number = 0;
  let grafo = []

  for (; idx < origenes.length; idx += 1) {
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

interface RespuestaFlujoMaximo {
  Flujo: number
  Data: Array<Camino>
}

interface Camino {
  data: Array<Vertices>,
  camino: string,
}

interface Vertices {
  origen: string,
  destino: string,
  peso: number,
}

function renderResponseFlujo(r: RespuestaFlujoMaximo) {
  let respuesta = document.getElementById("respuestaFlujo");
  let respHTML: string = `<p>Flujo Máximo: ${r.Flujo}</p><br>
  <table class="table table-hover">
  <thead class="thead-light"><tr>
  <th scope="col">Origen</th>
  <th scope="col">Destino</th>
  <th scope="col">Peso</th>
  </tr></thead><tbody>`;

  for (const [_, e] of r.Data.entries()) {
    respHTML += `<tr class="table-primary"><td class="success" colspan="3">${e.camino}</td><tr>`;

    for (const [_, v] of e.data.entries()) {
      respHTML += `
      <tr><td>${v.origen}</td>
      <td>${v.destino}</td>
      <td>${v.peso}</td></tr> `;
    }
  }

  respuesta.innerHTML = "";
  respuesta.insertAdjacentHTML("afterbegin", respHTML);
  respuesta.style.setProperty("display", "block", 'important');
}
