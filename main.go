package main

import (
	"encoding/json"
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
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func flujoMaximo(rw http.ResponseWriter, req *http.Request) {
	var grafo FlujoMaximo
	decoder := json.NewDecoder(req.Body)

	err := decoder.Decode(&grafo)
	if err != nil {
		log.Print(err)
	}

	answer := ResuelveFlujoMaximo(grafo)

	rw.Write(gzipF(&answer, &rw))
	log.Println("Flujo Máximo")
}

func FloyWarshall(rw http.ResponseWriter, req *http.Request) {
	var grafo []Vertice

	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&grafo)

	if err != nil {
		log.Print(err)
	}

	answer, _ := ResuelveFloyWarshall(&grafo)

	rw.Write(gzipF(&answer, &rw))
	log.Println("Floy-Warshall")
}

func CPM(rw http.ResponseWriter, req *http.Request) {
	var actividades []Vertice

	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&actividades)

	if err != nil {
		log.Print(err)
	}

	answer, _ := ResuelveCPM(actividades)

	rw.Write(gzipF(&answer, &rw))
	log.Println("CPM")
}

func PERT(rw http.ResponseWriter, req *http.Request) {
	var actividades []VerticePert

	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&actividades)

	if err != nil {
		log.Print(err)
	}

	answer, _ := ResuelvePERT(actividades)

	rw.Write(gzipF(&answer, &rw))
	log.Println("PERT")
}
