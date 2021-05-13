package main

import (
	"log"
	"net/http"
	"os"
)

func main() {
	log.Println("http://localhost:8080/")
	port := os.Getenv("PORT")

	js_files := http.StripPrefix("/js/", http.FileServer(http.Dir("./js")))
	static_files := http.FileServer(http.Dir("./static"))

	http.Handle("/js/", js_files)
	http.Handle("/", static_files)
	http.HandleFunc("/flujomaximo", flujoMaximo)

	log.Fatal(http.ListenAndServe(":"+port, nil))
}
