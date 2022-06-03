function runExample() {
  switch (activeTab) {
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
  const ejemplo = { "graph": [{ "source": "Bilbao", "target": "S1", "weight": 4 }, { "source": "Bilbao", "target": "S2", "weight": 1 }, { "source": "Barcelona", "target": "S1", "weight": 2 }, { "source": "Barcelona", "target": "S2", "weight": 3 }, { "source": "Sevilla", "target": "S1", "weight": 2 }, { "source": "Sevilla", "target": "S2", "weight": 2 }, { "source": "Sevilla", "target": "S3", "weight": 3 }, { "source": "Valencia", "target": "S2", "weight": 2 }, { "source": "Zaragoza", "target": "S2", "weight": 3 }, { "source": "Zaragoza", "target": "S3", "weight": 1 }, { "source": "Origen", "target": "Bilbao", "weight": 7 }, { "source": "Origen", "target": "Barcelona", "weight": 5 }, { "source": "Origen", "target": "Sevilla", "weight": 7 }, { "source": "Origen", "target": "Zaragoza", "weight": 6 }, { "source": "Origen", "target": "Valencia", "weight": 2 }, { "source": "S1", "target": "Madrid", "weight": 8 }, { "source": "S2", "target": "Madrid", "weight": 8 }, { "source": "S3", "target": "Madrid", "weight": 8 }], "source": "Origen", "target": "Madrid", "directed": true };
  (<HTMLInputElement>document.getElementById("origen")).value = ejemplo.source;
  (<HTMLInputElement>document.getElementById("destino")).value = ejemplo.target;
  fillTableExample("FlujoMaximo", ejemplo.graph);
  postData('flujomaximo', ejemplo).then(data => { renderResponseMaxFlow(data); });
}

function ejemploFloyd() {
  const ejemplo = [
    { source: "1", target: "2", weight: 3.0 },
    { source: "1", target: "4", weight: 5.0 },
    { source: "2", target: "1", weight: 2.0 },
    { source: "2", target: "4", weight: 4.0 },
    { source: "3", target: "2", weight: 1.0 },
    { source: "4", target: "3", weight: 2.0 },
  ];
  fillTableExample("FloydWarshall", ejemplo);
  postData('floydwarshall', ejemplo).then(data => { renderResponseFloydWarshall(data); });
}

function ejemploCPM() {
  const ejemplo = [{ "origen": "A", "destino": "-", "peso": 2 }, { "origen": "B", "destino": "A", "peso": 4 }, { "origen": "C", "destino": "B", "peso": 1 }, { "origen": "C", "destino": "H", "peso": 1 }, { "origen": "D", "destino": "-", "peso": 6 }, { "origen": "E", "destino": "G", "peso": 3 }, { "origen": "F", "destino": "E", "peso": 5 }, { "origen": "G", "destino": "D", "peso": 2 }, { "origen": "H", "destino": "G", "peso": 2 }, { "origen": "I", "destino": "D", "peso": 3 }, { "origen": "J", "destino": "I", "peso": 4 }, { "origen": "K", "destino": "D", "peso": 3 }, { "origen": "L", "destino": "J", "peso": 5 }, { "origen": "L", "destino": "K", "peso": 5 }, { "origen": "M", "destino": "C", "peso": 2 }, { "origen": "M", "destino": "L", "peso": 2 }];
  fillTableExample("CPM", ejemplo);
  postData('cpm', ejemplo).then(data => { renderResponseCPM(data); });
}

function ejemploPERT() {
  const ejemplo = [{ "origen": "A", "destino": "-", "optimista": 1, "probable": 2, "pesimista": 3 }, { "origen": "B", "destino": "A", "optimista": 2, "probable": 4, "pesimista": 6 }, { "origen": "C", "destino": "B", "optimista": 0, "probable": 1, "pesimista": 2 }, { "origen": "C", "destino": "H", "optimista": 0, "probable": 1, "pesimista": 2 }, { "origen": "D", "destino": "-", "optimista": 3, "probable": 6, "pesimista": 9 }, { "origen": "E", "destino": "G", "optimista": 2, "probable": 3, "pesimista": 4 }, { "origen": "F", "destino": "E", "optimista": 3, "probable": 5, "pesimista": 7 }, { "origen": "G", "destino": "D", "optimista": 1, "probable": 2, "pesimista": 3 }, { "origen": "H", "destino": "G", "optimista": 1, "probable": 2, "pesimista": 3 }, { "origen": "I", "destino": "D", "optimista": 1, "probable": 3, "pesimista": 5 }, { "origen": "J", "destino": "I", "optimista": 3, "probable": 4, "pesimista": 5 }, { "origen": "K", "destino": "D", "optimista": 2, "probable": 3, "pesimista": 4 }, { "origen": "L", "destino": "J", "optimista": 3, "probable": 5, "pesimista": 7 }, { "origen": "L", "destino": "K", "optimista": 3, "probable": 5, "pesimista": 7 }, { "origen": "M", "destino": "C", "optimista": 1, "probable": 2, "pesimista": 3 }, { "origen": "M", "destino": "L", "optimista": 1, "probable": 2, "pesimista": 3 }];
  fillTableExample("PERT", ejemplo);
  postData('pert', ejemplo).then(data => { renderResponsePERT(data); });
}

function ejemploCompresion() {
  const ejemplo = { "actividades": [{ "actividad": "A", "predecesora": "-", "pesoNormal": 8, "costoNormal": 100, "pesoUrgente": 6, "costoUrgente": 200 }, { "actividad": "B", "predecesora": "-", "pesoNormal": 4, "costoNormal": 150, "pesoUrgente": 2, "costoUrgente": 350 }, { "actividad": "C", "predecesora": "A", "pesoNormal": 2, "costoNormal": 50, "pesoUrgente": 1, "costoUrgente": 90 }, { "actividad": "D", "predecesora": "B", "pesoNormal": 5, "costoNormal": 100, "pesoUrgente": 1, "costoUrgente": 200 }, { "actividad": "E", "predecesora": "C", "pesoNormal": 3, "costoNormal": 80, "pesoUrgente": 1, "costoUrgente": 100 }, { "actividad": "E", "predecesora": "D", "pesoNormal": 3, "costoNormal": 80, "pesoUrgente": 1, "costoUrgente": 100 }, { "actividad": "F", "predecesora": "A", "pesoNormal": 10, "costoNormal": 100, "pesoUrgente": 5, "costoUrgente": 400 }], "tiempoObjetivo": -10 };
  fillTableExample("Aceleracion", ejemplo.actividades);
  postData('compresion', ejemplo).then(data => { renderResponseCompresion(data); });
}

function ejemploDijkstra() {
  const ejemplo = { "origen": "O", "destino": "T", "grafo": [{ "origen": "O", "destino": "A", "peso": 4 }, { "origen": "O", "destino": "B", "peso": 3 }, { "origen": "O", "destino": "C", "peso": 6 }, { "origen": "A", "destino": "D", "peso": 3 }, { "origen": "A", "destino": "C", "peso": 5 }, { "origen": "B", "destino": "C", "peso": 4 }, { "origen": "B", "destino": "E", "peso": 6 }, { "origen": "C", "destino": "D", "peso": 2 }, { "origen": "C", "destino": "F", "peso": 2 }, { "origen": "C", "destino": "E", "peso": 5 }, { "origen": "D", "destino": "G", "peso": 4 }, { "origen": "D", "destino": "F", "peso": 2 }, { "origen": "E", "destino": "F", "peso": 1 }, { "origen": "F", "destino": "G", "peso": 2 }, { "origen": "F", "destino": "H", "peso": 5 }, { "origen": "E", "destino": "H", "peso": 2 }, { "origen": "E", "destino": "I", "peso": 5 }, { "origen": "I", "destino": "H", "peso": 3 }, { "origen": "G", "destino": "H", "peso": 2 }, { "origen": "G", "destino": "T", "peso": 7 }, { "origen": "H", "destino": "T", "peso": 8 }, { "origen": "I", "destino": "T", "peso": 4 }] };
  (<HTMLInputElement>document.getElementById("OrigenDijkstra")).value = ejemplo.origen;
  (<HTMLInputElement>document.getElementById("DestinoDijkstra")).value = ejemplo.destino;
  fillTableExample("Dijkstra", ejemplo.grafo);
  postData('dijkstra', ejemplo).then(data => renderResponseDijkstra(data));
}

function ejemploKruskal() {
  const ejemplo = [{ "source": "C", "target": "B", "weight": 4 }, { "source": "A", "target": "C", "weight": 3 }, { "source": "A", "target": "B", "weight": 6 }, { "source": "B", "target": "D", "weight": 2 }, { "source": "C", "target": "D", "weight": 3 }, { "source": "S", "target": "A", "weight": 7 }, { "source": "B", "target": "T", "weight": 5 }, { "source": "D", "target": "T", "weight": 2 }, { "source": "S", "target": "C", "weight": 8 }];
  fillTableExample("Kruskal", ejemplo);
  Kruskal();
}
