function runExample() {
  switch(activeTab) {
    case Method.FlujoMaximo:
      ejemploFlujo();
      break;

    case Method.FloydWarshall:
      ejemploFloyd();
      break;

    case Method.CPM:
      ejemploCPM();
      break;

    case Method.PERT:
      ejemploPERT();
      break;

    case Method.Aceleracion:
      ejemploCompresion();
      break;

    case Method.Dijkstra:
      ejemploDijkstra();
      break;

    case Method.Kruskal:
      ejemploKruskal();
      break;
  }
}

function fillTableExample(method: string, ejemplo: any) {
  vertices.value = String(ejemplo.length);
  showTable();
  fillTable(method, ejemplo);
}

function ejemploFlujo() {
  const ejemplo =  {"data":[{"origen":"Bilbao","destino":"S1","peso":4},{"origen":"Bilbao","destino":"S2","peso":1},{"origen":"Barcelona","destino":"S1","peso":2},{"origen":"Barcelona","destino":"S2","peso":3},{"origen":"Sevilla","destino":"S1","peso":2},{"origen":"Sevilla","destino":"S2","peso":2},{"origen":"Sevilla","destino":"S3","peso":3},{"origen":"Valencia","destino":"S2","peso":2},{"origen":"Zaragoza","destino":"S2","peso":3},{"origen":"Zaragoza","destino":"S3","peso":1},{"origen":"Origen","destino":"Bilbao","peso":7},{"origen":"Origen","destino":"Barcelona","peso":5},{"origen":"Origen","destino":"Sevilla","peso":7},{"origen":"Origen","destino":"Zaragoza","peso":6},{"origen":"Origen","destino":"Valencia","peso":2},{"origen":"S1","destino":"Madrid","peso":8},{"origen":"S2","destino":"Madrid","peso":8},{"origen":"S3","destino":"Madrid","peso":8}],"origen":"Origen","destino":"Madrid","dirigido":true};
  (<HTMLInputElement>document.getElementById("origen")).value = ejemplo.origen;
  (<HTMLInputElement>document.getElementById("destino")).value = ejemplo.destino;
  fillTableExample("FlujoMaximo", ejemplo.data);
  postData('flujomaximo', ejemplo).then(data => {renderResponseFlujo(data);});
}

function ejemploFloyd() {
  const ejemplo = [{"origen":"1","destino":"2","peso":700}, {"origen":"1","destino":"3","peso":200},{"origen":"2","destino":"3","peso":300},{"origen":"2","destino":"4","peso":200},{"origen":"2","destino":"6","peso":400},{"origen":"3","destino":"4","peso":700},{"origen":"3","destino":"5","peso":600},{"origen":"4","destino":"6","peso":100},{"origen":"4","destino":"5","peso":300},{"origen":"6","destino":"5","peso":500}];
  fillTableExample("FloydWarshall", ejemplo);
  postData('floydwarshall', ejemplo).then(data => {renderResponseFloyd(data);});
}

function ejemploCPM() {
  const ejemplo = [{"origen":"A","destino":"-","peso":2},{"origen":"B","destino":"A","peso":4},{"origen":"C","destino":"B","peso":1},{"origen":"C","destino":"H","peso":1},{"origen":"D","destino":"-","peso":6},{"origen":"E","destino":"G","peso":3},{"origen":"F","destino":"E","peso":5},{"origen":"G","destino":"D","peso":2},{"origen":"H","destino":"G","peso":2},{"origen":"I","destino":"D","peso":3},{"origen":"J","destino":"I","peso":4},{"origen":"K","destino":"D","peso":3},{"origen":"L","destino":"J","peso":5},{"origen":"L","destino":"K","peso":5},{"origen":"M","destino":"C","peso":2},{"origen":"M","destino":"L","peso":2}];
  fillTableExample("CPM", ejemplo);
  postData('cpm', ejemplo).then(data => {renderResponseCPM(data);});
}

function ejemploPERT() {
  const ejemplo = [{"origen":"A","destino":"-","optimista":1,"probable":2,"pesimista":3},{"origen":"B","destino":"A","optimista":2,"probable":4,"pesimista":6},{"origen":"C","destino":"B","optimista":0,"probable":1,"pesimista":2},{"origen":"C","destino":"H","optimista":0,"probable":1,"pesimista":2},{"origen":"D","destino":"-","optimista":3,"probable":6,"pesimista":9},{"origen":"E","destino":"G","optimista":2,"probable":3,"pesimista":4},{"origen":"F","destino":"E","optimista":3,"probable":5,"pesimista":7},{"origen":"G","destino":"D","optimista":1,"probable":2,"pesimista":3},{"origen":"H","destino":"G","optimista":1,"probable":2,"pesimista":3},{"origen":"I","destino":"D","optimista":1,"probable":3,"pesimista":5},{"origen":"J","destino":"I","optimista":3,"probable":4,"pesimista":5},{"origen":"K","destino":"D","optimista":2,"probable":3,"pesimista":4},{"origen":"L","destino":"J","optimista":3,"probable":5,"pesimista":7},{"origen":"L","destino":"K","optimista":3,"probable":5,"pesimista":7},{"origen":"M","destino":"C","optimista":1,"probable":2,"pesimista":3},{"origen":"M","destino":"L","optimista":1,"probable":2,"pesimista":3}];
  fillTableExample("PERT", ejemplo);
  postData('pert', ejemplo).then(data => {renderResponsePERT(data);});
}

function ejemploCompresion() {
  const ejemplo = {"actividades":[{"actividad":"A","predecesora":"-","pesoNormal":8,"costoNormal":100,"pesoUrgente":6,"costoUrgente":200},{"actividad":"B","predecesora":"-","pesoNormal":4,"costoNormal":150,"pesoUrgente":2,"costoUrgente":350},{"actividad":"C","predecesora":"A","pesoNormal":2,"costoNormal":50,"pesoUrgente":1,"costoUrgente":90},{"actividad":"D","predecesora":"B","pesoNormal":5,"costoNormal":100,"pesoUrgente":1,"costoUrgente":200},{"actividad":"E","predecesora":"C","pesoNormal":3,"costoNormal":80,"pesoUrgente":1,"costoUrgente":100},{"actividad":"E","predecesora":"D","pesoNormal":3,"costoNormal":80,"pesoUrgente":1,"costoUrgente":100},{"actividad":"F","predecesora":"A","pesoNormal":10,"costoNormal":100,"pesoUrgente":5,"costoUrgente":400}],"tiempoObjetivo":-10};
  fillTableExample("Aceleracion", ejemplo.actividades);
  postData('compresion', ejemplo).then(data => {renderResponseCompresion(data);});
}

function ejemploDijkstra() {
  const ejemplo ={"origen":"O","destino":"T","grafo":[{"origen":"O","destino":"A","peso":4},{"origen":"O","destino":"B","peso":3},{"origen":"O","destino":"C","peso":6},{"origen":"A","destino":"D","peso":3},{"origen":"A","destino":"C","peso":5},{"origen":"B","destino":"C","peso":4},{"origen":"B","destino":"E","peso":6},{"origen":"C","destino":"D","peso":2},{"origen":"C","destino":"F","peso":2},{"origen":"C","destino":"E","peso":5},{"origen":"D","destino":"G","peso":4},{"origen":"D","destino":"F","peso":2},{"origen":"E","destino":"F","peso":1},{"origen":"F","destino":"G","peso":2},{"origen":"F","destino":"H","peso":5},{"origen":"E","destino":"H","peso":2},{"origen":"E","destino":"I","peso":5},{"origen":"I","destino":"H","peso":3},{"origen":"G","destino":"H","peso":2},{"origen":"G","destino":"T","peso":7},{"origen":"H","destino":"T","peso":8},{"origen":"I","destino":"T","peso":4}]};
  (<HTMLInputElement>document.getElementById("OrigenDijkstra")).value = ejemplo.origen;
  (<HTMLInputElement>document.getElementById("DestinoDijkstra")).value = ejemplo.destino;
  fillTableExample("Dijkstra", ejemplo.grafo);
  postData('dijkstra', ejemplo).then(data => renderResponseDijkstra(data));
}

function ejemploKruskal() {
  const ejemplo = [{"origen":"C","destino":"B","peso":4},{"origen":"A","destino":"C","peso":3},{"origen":"A","destino":"B","peso":6},{"origen":"B","destino":"D","peso":2},{"origen":"C","destino":"D","peso":3},{"origen":"S","destino":"A","peso":7},{"origen":"B","destino":"T","peso":5},{"origen":"D","destino":"T","peso":2},{"origen":"S","destino":"C","peso":8}];
  fillTableExample("Kruskal", ejemplo);
  Kruskal();
}
