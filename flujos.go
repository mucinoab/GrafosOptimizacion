package main

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
)

type FlujoMaximo struct {
	Grafo    []Vertice `json:"data"`
	Origen   string    `json:"origen"`
	Destino  string    `json:"destino"`
	Dirigido bool      `json:"dirigido"`
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

func ResuelveFlujoMaximo(grafo FlujoMaximo) []byte {
	var sol RespuestaFlujoMaximo
	var vertices []Vertice

	m := VerticesToAdjList(&grafo.Grafo, grafo.Dirigido)
	m_og := VerticesToAdjList(&grafo.Grafo, grafo.Dirigido)

	for _, a := range grafo.Grafo {
		vertices = append(vertices, Vertice{a.Origen, a.Destino, a.Peso})
		if !grafo.Dirigido {
			vertices = append(vertices, Vertice{a.Destino, a.Origen, a.Peso})
		}
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
		return nil
	} else {
		return s
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
		camino += "|c* = Mín{"

		flujo = Min(marcado, grafo)
		for _, v := range *marcado {
			camino += fmt.Sprintf("%.2f,", grafo[v.izq][v.der])
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

		if p > 0.0 && !Find(marcado, v) {
			*marcado = append(*marcado, v)
			flujo += dfs(sol, marcado, grafo, n, destino)
			Pop(marcado)
		}
	}

	return flujo
}
