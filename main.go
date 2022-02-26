package main

import (
	"grafos/methods"
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")

	if len(port) == 0 {
		port = "8000"
	}

	staticFiles := http.FileServer(http.Dir("./static"))
	jsFiles := http.StripPrefix("/js/", http.FileServer(http.Dir("./js")))

	http.Handle("/", staticFiles)
	http.Handle("/js/", jsFiles)
	http.HandleFunc("/flujomaximo", flujoMaximo)
	http.HandleFunc("/floydwarshall", FloyWarshall)
	http.HandleFunc("/cpm", CPM)
	http.HandleFunc("/pert", PERT)
	http.HandleFunc("/compresion", Compresion)
	http.HandleFunc("/dijkstra", Dijkstra)
	http.HandleFunc("/kruskal", Kruskal)

	log.Printf("http://localhost:%s", port)
	log.Panic(http.ListenAndServe(":"+port, methods.GzipHandler(http.DefaultServeMux)))
}

func flujoMaximo(rw http.ResponseWriter, req *http.Request) {
	var grafo methods.FlujoMaximo
	methods.Deserialize(req.Body, &grafo)

	rw.Header().Set("Content-Type", "application/json")
	rw.Write(methods.ToBytes(methods.ResuelveFlujoMaximo(grafo)))
}

func FloyWarshall(rw http.ResponseWriter, req *http.Request) {
	var grafo []methods.Edge
	methods.Deserialize(req.Body, &grafo)

	rw.Header().Set("Content-Type", "application/json")
	rw.Write(methods.ToBytes(methods.ResuelveFloyWarshall(&grafo)))
}

func CPM(rw http.ResponseWriter, req *http.Request) {
	var actividades []methods.Edge
	methods.Deserialize(req.Body, &actividades)

	rw.Header().Set("Content-Type", "application/json")
	rw.Write(methods.ToBytes(methods.ResuelveCPM(actividades)))
}

func Dijkstra(rw http.ResponseWriter, req *http.Request) {
	var actividades methods.Dijkstra
	methods.Deserialize(req.Body, &actividades)

	rw.Header().Set("Content-Type", "application/json")
	rw.Write(methods.ToBytes(methods.ResuelveDijkstra(actividades)))
}

func PERT(rw http.ResponseWriter, req *http.Request) {
	var actividades []methods.VerticePert
	methods.Deserialize(req.Body, &actividades)

	rw.Header().Set("Content-Type", "application/json")
	rw.Write(methods.ToBytes(methods.ResuelvePERT(actividades)))
}

func Compresion(rw http.ResponseWriter, req *http.Request) {
	var actividades methods.CompresionData
	methods.Deserialize(req.Body, &actividades)

	rw.Header().Set("Content-Type", "application/json")
	rw.Write(methods.ToBytes(methods.ResuelveCompresion(actividades)))
}

func Kruskal(rw http.ResponseWriter, req *http.Request) {
	var grafo []methods.Edge
	methods.Deserialize(req.Body, &grafo)

	rw.Header().Set("Content-Type", "application/json")
	rw.Write(methods.ToBytes(methods.ResuelveKruskal(grafo)))
}
