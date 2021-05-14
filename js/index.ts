function MostartTabla(tablaId: string, formId: string) {
  const form = <HTMLFormElement> document.getElementById(formId);

  if (form.checkValidity()) {
    if (GeneraTabla()) {
      document.getElementById(tablaId).style.setProperty("display", "block", 'important');
    } else {
      alert("Número de vértices NO valido.");
    }
  } else {
    form.reportValidity();
  }
}

function GeneraTabla(): boolean {
  const vertices = <HTMLInputElement>document.getElementById("Nvertices");
  const nvertices: number = parseInt(vertices.value, 10);

  if (isNaN(nvertices)){
    return false;
  }

  let tabalaHtml = document.getElementById("FlujoTabla");
  tabalaHtml.innerHTML = "";

  let tabla: string = "";
  let i: number = 0;

  // #, origen, destino, peso
  for (; i < nvertices; i += 1) {
    tabla += `<tr><td>${i}</td><td><input type="text" class="form-control origenes" required></td>`;
    tabla += `<td><input type="text" class="form-control destinos" required></td>`;
    tabla += `<td><input type="text" class="form-control pesos" placeholder="0.0" required></td></tr>`;
  }

  tabla += `
  <br> <label for="exampleInputEmail1" class="form-label">Nodo Origen</label>
    <input type="text" class="form-control pesos" id="origen" required>
  <br> <label for="exampleInputEmail1" class="form-label">Nodo Destino</label>
    <input type="text" class="form-control pesos" id="destino" required>`;


  tabalaHtml.insertAdjacentHTML("afterbegin", tabla);

  return true;
}

function flujoMaximo(tablaId: string) {
  const tabla = <HTMLFormElement>document.getElementById(tablaId);

  if (!tabla.checkValidity()) {
    tabla.reportValidity();
    return;
  }

  const origenes = document.querySelectorAll<HTMLInputElement>(".origenes");
  const destinos = document.querySelectorAll<HTMLInputElement>(".destinos");
  const pesos = document.querySelectorAll<HTMLInputElement>(".pesos");
  const origen = <HTMLInputElement>document.getElementById("origen");
  const destino = <HTMLInputElement>document.getElementById("destino");

  let payload = {
    data:[],
    origen: origen.value.trim(),
    destino: destino.value.trim()
  };

  let idx: number = 0;
  let peso: number = 0;

  for (; idx < origenes.length; idx += 1) {
    peso = parseFloat(pesos[idx].value.trim());

    if (isNaN(peso)) {
      alert("Por favor verifica que los pesos ingresados sean números.")
      return;
    }

    payload.data.push({
      origen: origenes[idx].value.trim(),
      destino: destinos[idx].value.trim(),
      peso: peso
    });
  }

  postData('flujomaximo', payload)
  .then(data => {
    renderResponse(data);
  });
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

function renderResponse(r: RespuestaFlujoMaximo) {
  let respuesta = document.getElementById("respuesta");
  let respHTML: string = `<p>Flujo Máximo: ${r.Flujo}</p><br>
  <table class="table table-hover">
  <thead class="thead-light"><tr>
  <th scope="col">Origen</th>
  <th scope="col">Destino</th>
  <th scope="col">Peso</th>
  </tr></thead><tbody>`;

  for (const [_, e] of r.Data.entries()) {
    respHTML += `<tr class="table-primary"><td colspan="3">${e.camino}</td><tr>`;

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
