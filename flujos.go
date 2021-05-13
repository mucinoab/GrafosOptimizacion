package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

type Vertice struct {
	Origen  string  `json:"origen"`
	Destino string  `json:"destino"`
	Peso    float64 `json:"peso"`
}

type FlujoMaximo struct {
	Data    []Vertice `json:"data"`
	Origen  string    `json:"origen"`
	Destino string    `json:"destino"`
}

type RespuestaFlujoMaximo struct {
	Flujo float64
	Data  []struct {
		V      []Vertice `json:"data"`
		Camino string    `json:"camino"`
	}
}

type camino struct {
	izq, der string
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

func ResuelveFlujoMaximo(grafo FlujoMaximo) string {
	var sol RespuestaFlujoMaximo
	var vertices []Vertice

	m := make(map[string]map[string]float64)
	m_og := make(map[string]map[string]float64)

	for _, a := range grafo.Data {
		if _, ok := m[a.Origen]; !ok {
			m[a.Origen] = make(map[string]float64)
			m_og[a.Origen] = make(map[string]float64)
		}

		m[a.Origen][a.Destino] = a.Peso
		m_og[a.Origen][a.Destino] = a.Peso
		vertices = append(vertices, Vertice{a.Origen, a.Destino, a.Peso})
	}

	sol.Data = append(sol.Data, struct {
		V      []Vertice "json:\"data\""
		Camino string    "json:\"camino\""
	}{
		V:      vertices,
		Camino: "Grafo Inicial",
	})

	marcados := make([]camino, 0)
	sol.Flujo = dfs(&sol, &marcados, m, grafo.Origen, grafo.Destino)

	vertices = make([]Vertice, 0)

	for a, l := range m {
		for b, p := range l {
			vertices = append(vertices, Vertice{a, b, m_og[a][b] - p})
		}
	}

	sol.Data = append(sol.Data, struct {
		V      []Vertice "json:\"data\""
		Camino string    "json:\"camino\""
	}{
		V:      vertices,
		Camino: "Patrón de Flujo",
	})

	s, err := json.Marshal(sol)

	if err != nil {
		log.Println(err)
		return "Error"
	} else {
		return string(s)
	}
}

func dfs(sol *RespuestaFlujoMaximo, marcado *[]camino, grafo map[string]map[string]float64, actual, destino string) float64 {
	var flujo float64

	if actual == destino {
		var camino string

		for _, v := range *marcado {
			camino += v.izq + ","
		}

		camino += destino
		camino = strings.ToUpper(camino)
		camino += "   |   c* = Mín{"

		flujo = Min(marcado, grafo)
		for _, v := range *marcado {
			camino += fmt.Sprintf("%.2f, ", grafo[v.izq][v.der])
			grafo[v.izq][v.der] -= flujo
		}

		camino = fmt.Sprint(strings.Trim(camino, " ,"), "} = ", flujo)

		var vertices []Vertice

		for a, l := range grafo {
			for b, p := range l {
				vertices = append(vertices, Vertice{a, b, p})
			}
		}

		sol.Data = append(sol.Data, struct {
			V      []Vertice "json:\"data\""
			Camino string    "json:\"camino\""
		}{
			V:      vertices,
			Camino: camino,
		})

		return flujo
	}

	for n, p := range grafo[actual] {
		v := camino{actual, n}

		if p > 0 && !Find(marcado, v) {
			*marcado = append(*marcado, v)
			flujo += dfs(sol, marcado, grafo, n, destino)
			Pop(marcado)
		}
	}

	return flujo
}
