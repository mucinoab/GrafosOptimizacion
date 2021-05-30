package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	static_files := http.FileServer(http.Dir("./static"))
	js_files := http.StripPrefix("/js/", http.FileServer(http.Dir("./js")))

	http.Handle("/", static_files)
	http.Handle("/js/", js_files)
	http.HandleFunc("/flujomaximo", flujoMaximo)
	http.HandleFunc("/floydwarshall", FloyWarshall)
	http.HandleFunc("/cpm", CPM)
	http.HandleFunc("/pert", PERT)

	log.Printf("http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, gzipHandler(http.DefaultServeMux)))
}

func flujoMaximo(rw http.ResponseWriter, req *http.Request) {
	var grafo FlujoMaximo
	deserialize(req.Body, &grafo)

	rw.Write(toBytes(ResuelveFlujoMaximo(grafo)))
}

func FloyWarshall(rw http.ResponseWriter, req *http.Request) {
	var grafo []Vertice
	deserialize(req.Body, &grafo)

	rw.Write(toBytes(ResuelveFloyWarshall(&grafo)))
}

func CPM(rw http.ResponseWriter, req *http.Request) {
	var actividades []Vertice
	deserialize(req.Body, &actividades)

	rw.Write(toBytes(ResuelveCPM(actividades)))
}

func PERT(rw http.ResponseWriter, req *http.Request) {
	var actividades []VerticePert
	deserialize(req.Body, &actividades)

	rw.Write(toBytes(ResuelvePERT(actividades)))
}
