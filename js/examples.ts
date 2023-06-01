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
  const ejemplo = {
    source: "Origen",
    target: "Madrid",
    directed: true,
    graph: [
      { source: "Bilbao", target: "S1", weight: 4 }, { source: "Bilbao", target: "S2", weight: 1 }, { source: "Barcelona", target: "S1", weight: 2 },
      { source: "Barcelona", target: "S2", weight: 3 }, { source: "Sevilla", target: "S1", weight: 2 }, { source: "Sevilla", target: "S2", weight: 2 },
      { source: "Sevilla", target: "S3", weight: 3 }, { source: "Valencia", target: "S2", weight: 2 }, { source: "Zaragoza", target: "S2", weight: 3 },
      { source: "Zaragoza", target: "S3", weight: 1 }, { source: "Origen", target: "Bilbao", weight: 7 }, { source: "Origen", target: "Barcelona", weight: 5 },
      { source: "Origen", target: "Sevilla", weight: 7 }, { source: "Origen", target: "Zaragoza", weight: 6 }, { source: "Origen", target: "Valencia", weight: 2 },
      { source: "S1", target: "Madrid", weight: 8 }, { source: "S2", target: "Madrid", weight: 8 }, { source: "S3", target: "Madrid", weight: 8 }
    ]
  };
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
  const ejemplo = [
    { source: "A", target: "-", weight: 2 }, { source: "B", target: "A", weight: 4 },
    { source: "C", target: "B", weight: 1 }, { source: "C", target: "H", weight: 1 },
    { source: "D", target: "-", weight: 6 }, { source: "E", target: "G", weight: 3 },
    { source: "F", target: "E", weight: 5 }, { source: "G", target: "D", weight: 2 },
    { source: "H", target: "G", weight: 2 }, { source: "I", target: "D", weight: 3 },
    { source: "J", target: "I", weight: 4 }, { source: "K", target: "D", weight: 3 },
    { source: "L", target: "J", weight: 5 }, { source: "L", target: "K", weight: 5 },
    { source: "M", target: "C", weight: 2 }, { source: "M", target: "L", weight: 2 }
  ];
  fillTableExample("CPM", ejemplo);
  postData('cpm', ejemplo).then(data => { renderResponseCPM(data); });
}

function ejemploPERT() {
  const ejemplo = [
    { source: "A", target: "-", optimistic_weight: 1, weight: 2, pessimistic_weight: 3 },
    { source: "B", target: "A", optimistic_weight: 2, weight: 4, pessimistic_weight: 6 },
    { source: "C", target: "B", optimistic_weight: 0, weight: 1, pessimistic_weight: 2 },
    { source: "C", target: "H", optimistic_weight: 0, weight: 1, pessimistic_weight: 2 },
    { source: "D", target: "-", optimistic_weight: 3, weight: 6, pessimistic_weight: 9 },
    { source: "E", target: "G", optimistic_weight: 2, weight: 3, pessimistic_weight: 4 },
    { source: "F", target: "E", optimistic_weight: 3, weight: 5, pessimistic_weight: 7 },
    { source: "G", target: "D", optimistic_weight: 1, weight: 2, pessimistic_weight: 3 },
    { source: "H", target: "G", optimistic_weight: 1, weight: 2, pessimistic_weight: 3 },
    { source: "I", target: "D", optimistic_weight: 1, weight: 3, pessimistic_weight: 5 },
    { source: "J", target: "I", optimistic_weight: 3, weight: 4, pessimistic_weight: 5 },
    { source: "K", target: "D", optimistic_weight: 2, weight: 3, pessimistic_weight: 4 },
    { source: "L", target: "J", optimistic_weight: 3, weight: 5, pessimistic_weight: 7 },
    { source: "L", target: "K", optimistic_weight: 3, weight: 5, pessimistic_weight: 7 },
    { source: "M", target: "C", optimistic_weight: 1, weight: 2, pessimistic_weight: 3 },
    { source: "M", target: "L", optimistic_weight: 1, weight: 2, pessimistic_weight: 3 }
  ];
  fillTableExample("PERT", ejemplo);
  postData('pert', ejemplo).then(data => { renderResponsePERT(data); });
}

function ejemploCompresion() {
  const ejemplo: Compression = {
    activities: [
      { target: "A", source: "-", normal_weight: 8, normal_cost: 100, urgent_weight: 6, urgent_cost: 200 },
      { target: "B", source: "-", normal_weight: 4, normal_cost: 150, urgent_weight: 2, urgent_cost: 350 },
      { target: "C", source: "A", normal_weight: 2, normal_cost: 50, urgent_weight: 1, urgent_cost: 90 },
      { target: "D", source: "B", normal_weight: 5, normal_cost: 100, urgent_weight: 1, urgent_cost: 200 },
      { target: "E", source: "C", normal_weight: 3, normal_cost: 80, urgent_weight: 1, urgent_cost: 100 },
      { target: "E", source: "D", normal_weight: 3, normal_cost: 80, urgent_weight: 1, urgent_cost: 100 },
      { target: "F", source: "A", normal_weight: 10, normal_cost: 100, urgent_weight: 5, urgent_cost: 400 }
    ],
    target_time: -10
  };

  fillTableExample("Aceleracion", ejemplo.activities);
  postData('compresion', ejemplo).then(data => { renderResponseCompresion(data); });
}

function ejemploDijkstra() {
  const ejemplo = {
    source: "O",
    target: "T",
    graph: [
      { source: "O", target: "A", weight: 4 }, { source: "O", target: "B", weight: 3 }, { source: "O", target: "C", weight: 6 },
      { source: "A", target: "D", weight: 3 }, { source: "A", target: "C", weight: 5 }, { source: "B", target: "C", weight: 4 },
      { source: "B", target: "E", weight: 6 }, { source: "C", target: "D", weight: 2 }, { source: "C", target: "F", weight: 2 },
      { source: "C", target: "E", weight: 5 }, { source: "D", target: "G", weight: 4 }, { source: "D", target: "F", weight: 2 },
      { source: "E", target: "F", weight: 1 }, { source: "F", target: "G", weight: 2 }, { source: "F", target: "H", weight: 5 },
      { source: "E", target: "H", weight: 2 }, { source: "E", target: "I", weight: 5 }, { source: "I", target: "H", weight: 3 },
      { source: "G", target: "H", weight: 2 }, { source: "G", target: "T", weight: 7 }, { source: "H", target: "T", weight: 8 },
      { source: "I", target: "T", weight: 4 }
    ]
  };
  (<HTMLInputElement>document.getElementById("OrigenDijkstra")).value = ejemplo.source;
  (<HTMLInputElement>document.getElementById("DestinoDijkstra")).value = ejemplo.target;
  fillTableExample("Dijkstra", ejemplo.graph);
  postData('dijkstra', ejemplo).then(data => renderResponseDijkstra(data));
}

function ejemploKruskal() {
  const ejemplo = [
    { source: "C", target: "B", weight: 4 }, { source: "A", target: "C", weight: 3 },
    { source: "A", target: "B", weight: 6 }, { source: "B", target: "D", weight: 2 },
    { source: "C", target: "D", weight: 3 }, { source: "S", target: "A", weight: 7 },
    { source: "B", target: "T", weight: 5 }, { source: "D", target: "T", weight: 2 },
    { source: "S", target: "C", weight: 8 }
  ];
  fillTableExample("Kruskal", ejemplo);
  Kruskal();
}
