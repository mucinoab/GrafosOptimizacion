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
    let payload = grafoDeTabla(tablaId);
    console.log(payload);
    postData('floydwarshall', payload)
        .then(data => {
        renderResponseFlujo(data);
    });
}
function grafoDeTabla(id) {
    const origenes = document.querySelectorAll(`.origenes${id}`);
    const destinos = document.querySelectorAll(`.destinos${id}`);
    const pesos = document.querySelectorAll(`.pesos${id}`);
    console.log(origenes);
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
    let respHTML = `<p>Flujo Máximo: ${r.Flujo}</p><br>
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
