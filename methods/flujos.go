package methods

import (
	"fmt"
	"strings"
)

type FlujoMaximo struct {
	Grafo    []Edge `json:"data"`
	Origen   string `json:"origen"`
	Destino  string `json:"destino"`
	Dirigido bool   `json:"dirigido"`
}

type RespuestaFlujoMaximo struct {
	Flujo float64
	Data  []struct {
		V      []Edge `json:"data"`
		Camino string `json:"camino"`
	}
}

type Camino struct {
	izq, der string
}

func ResuelveFlujoMaximo(grafo FlujoMaximo) RespuestaFlujoMaximo {
	var sol RespuestaFlujoMaximo
	var vertices []Edge

	m := VerticesToAdjList(&grafo.Grafo, grafo.Dirigido)
	mOg := VerticesToAdjList(&grafo.Grafo, grafo.Dirigido)

	for _, a := range grafo.Grafo {
		vertices = append(vertices, Edge{a.Source, a.Target, a.Weight})
		if !grafo.Dirigido {
			vertices = append(vertices, Edge{a.Target, a.Source, a.Weight})
		}
	}

	sol.Data = append(sol.Data, struct {
		V      []Edge "json:\"data\""
		Camino string "json:\"camino\""
	}{
		V:      vertices,
		Camino: "Grafo Inicial",
	})

	marcados := make([]Camino, 0)
	sol.Flujo = dfs(&sol, &marcados, m, grafo.Origen, grafo.Destino)

	vertices = make([]Edge, 0)

	for a, l := range m {
		for b, p := range l {
			vertices = append(vertices, Edge{a, b, mOg[a][b] - p})
		}
	}

	sol.Data = append(sol.Data, struct {
		V      []Edge "json:\"data\""
		Camino string "json:\"camino\""
	}{
		V:      vertices,
		Camino: "Patrón de Flujo",
	})

	return sol
}

func dfs(sol *RespuestaFlujoMaximo, marcado *[]Camino, grafo map[string]map[string]float64, actual, destino string) float64 {
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

		var vertices []Edge

		for a, l := range grafo {
			for b, p := range l {
				vertices = append(vertices, Edge{a, b, p})
			}
		}

		sol.Data = append(sol.Data, struct {
			V      []Edge "json:\"data\""
			Camino string "json:\"camino\""
		}{
			V:      vertices,
			Camino: camino,
		})

		return flujo
	}

	for n, p := range grafo[actual] {
		v := Camino{actual, n}

		if p > 0.0 && !Find(marcado, v) {
			*marcado = append(*marcado, v)
			flujo += dfs(sol, marcado, grafo, n, destino)
			Pop(marcado)
		}
	}

	return flujo
}
