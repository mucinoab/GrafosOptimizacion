function fillTableEjemplo(method, ejemplo) {
    document.getElementById(`Nvertices${method}`).value = String(ejemplo.length);
    showTable(method, `formulario${method}`, `Nvertices${method}`);
    if (method === "PERT") {
        fillTable(method, ejemplo, true);
    }
    else {
        fillTable(method, ejemplo, false);
    }
}
function ejemploFlujo() {
    const ejemplo = { "data": [{ "origen": "Bilbao", "destino": "S1", "peso": 4 }, { "origen": "Bilbao", "destino": "S2", "peso": 1 }, { "origen": "Barcelona", "destino": "S1", "peso": 2 }, { "origen": "Barcelona", "destino": "S2", "peso": 3 }, { "origen": "Sevilla", "destino": "S1", "peso": 2 }, { "origen": "Sevilla", "destino": "S2", "peso": 2 }, { "origen": "Sevilla", "destino": "S3", "peso": 3 }, { "origen": "Valencia", "destino": "S2", "peso": 2 }, { "origen": "Zaragoza", "destino": "S2", "peso": 3 }, { "origen": "Zaragoza", "destino": "S3", "peso": 1 }, { "origen": "Origen", "destino": "Bilbao", "peso": 7 }, { "origen": "Origen", "destino": "Barcelona", "peso": 5 }, { "origen": "Origen", "destino": "Sevilla", "peso": 7 }, { "origen": "Origen", "destino": "Zaragoza", "peso": 6 }, { "origen": "Origen", "destino": "Valencia", "peso": 2 }, { "origen": "S1", "destino": "Madrid", "peso": 8 }, { "origen": "S2", "destino": "Madrid", "peso": 8 }, { "origen": "S3", "destino": "Madrid", "peso": 8 }], "origen": "Origen", "destino": "Madrid", "dirigido": true };
    postData('flujomaximo', ejemplo).then(data => { renderResponseFlujo(data); });
}
function ejemploFloyd() {
    const ejemplo = [{ "origen": "1", "destino": "2", "peso": 700 }, { "origen": "1", "destino": "3", "peso": 200 }, { "origen": "2", "destino": "3", "peso": 300 }, { "origen": "2", "destino": "4", "peso": 200 }, { "origen": "2", "destino": "6", "peso": 400 }, { "origen": "3", "destino": "4", "peso": 700 }, { "origen": "3", "destino": "5", "peso": 600 }, { "origen": "4", "destino": "6", "peso": 100 }, { "origen": "4", "destino": "5", "peso": 300 }, { "origen": "6", "destino": "5", "peso": 500 }];
    postData('floydwarshall', ejemplo).then(data => { renderResponseFloyd(data); });
}
function ejemploCPM() {
    const ejemplo = [{ "origen": "A", "destino": "-", "peso": 2 }, { "origen": "B", "destino": "A", "peso": 4 }, { "origen": "C", "destino": "B", "peso": 1 }, { "origen": "C", "destino": "H", "peso": 1 }, { "origen": "D", "destino": "-", "peso": 6 }, { "origen": "E", "destino": "G", "peso": 3 }, { "origen": "F", "destino": "E", "peso": 5 }, { "origen": "G", "destino": "D", "peso": 2 }, { "origen": "H", "destino": "G", "peso": 2 }, { "origen": "I", "destino": "D", "peso": 3 }, { "origen": "J", "destino": "I", "peso": 4 }, { "origen": "K", "destino": "D", "peso": 3 }, { "origen": "L", "destino": "J", "peso": 5 }, { "origen": "L", "destino": "K", "peso": 5 }, { "origen": "M", "destino": "C", "peso": 2 }, { "origen": "M", "destino": "L", "peso": 2 }];
    fillTableEjemplo("CPM", ejemplo);
    postData('cpm', ejemplo).then(data => { renderResponseCPM(data); });
}
function ejemploPERT() {
    const ejemplo = [{ "origen": "A", "destino": "-", "optimista": 1, "probable": 2, "pesimista": 3 }, { "origen": "B", "destino": "A", "optimista": 2, "probable": 4, "pesimista": 6 }, { "origen": "C", "destino": "B", "optimista": 0, "probable": 1, "pesimista": 2 }, { "origen": "C", "destino": "H", "optimista": 0, "probable": 1, "pesimista": 2 }, { "origen": "D", "destino": "-", "optimista": 3, "probable": 6, "pesimista": 9 }, { "origen": "E", "destino": "G", "optimista": 2, "probable": 3, "pesimista": 4 }, { "origen": "F", "destino": "E", "optimista": 3, "probable": 5, "pesimista": 7 }, { "origen": "G", "destino": "D", "optimista": 1, "probable": 2, "pesimista": 3 }, { "origen": "H", "destino": "G", "optimista": 1, "probable": 2, "pesimista": 3 }, { "origen": "I", "destino": "D", "optimista": 1, "probable": 3, "pesimista": 5 }, { "origen": "J", "destino": "I", "optimista": 3, "probable": 4, "pesimista": 5 }, { "origen": "K", "destino": "D", "optimista": 2, "probable": 3, "pesimista": 4 }, { "origen": "L", "destino": "J", "optimista": 3, "probable": 5, "pesimista": 7 }, { "origen": "L", "destino": "K", "optimista": 3, "probable": 5, "pesimista": 7 }, { "origen": "M", "destino": "C", "optimista": 1, "probable": 2, "pesimista": 3 }, { "origen": "M", "destino": "L", "optimista": 1, "probable": 2, "pesimista": 3 }];
    fillTableEjemplo("PERT", ejemplo);
    postData('pert', ejemplo).then(data => { renderResponsePERT(data); });
}
