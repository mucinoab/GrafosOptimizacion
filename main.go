package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
)

func main() {
	port := os.Getenv("PORT")
	js_files := http.StripPrefix("/js/", http.FileServer(http.Dir("./js")))
	static_files := http.FileServer(http.Dir("./static"))

	http.Handle("/js/", js_files)
	http.Handle("/", static_files)
	http.HandleFunc("/flujomaximo", flujoMaximo)
	http.HandleFunc("/floydwarshall", FloyWarshall)

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

	io.WriteString(rw, answer)
	log.Println("Flujo Máximo")
}

func FloyWarshall(rw http.ResponseWriter, req *http.Request) {
	var grafo []Vertice

	decoder := json.NewDecoder(req.Body)
	err := decoder.Decode(&grafo)

	if err != nil {
		log.Print(err)
	}

	answer, _ := ResuelveFloyWarshall(grafo)

	io.WriteString(rw, answer)
	log.Println("Floy Warshall")
}
