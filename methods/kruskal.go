package methods

import (
	"fmt"
	"sort"
	"strings"
)

type RespuestaKruskal struct {
	Grafo  []Vertice `json:"grafo"`
	Arbol  []int     `json:"arbol"`
	Peso   float64   `json:"peso"`
	Graphs []string  `json:"graphs"`
}

func ResuelveKruskal(grafo []Vertice) RespuestaKruskal {
	sort.Slice(grafo, func(i, j int) bool { return grafo[i].Peso < grafo[j].Peso })

	links := make([]string, 0, len(grafo)+2)
	camino := ""

	links = append(links, GraphLink(grafo, camino, "", false))

	uf := NewUnionFind(grafo)
	arbol := make([]int, 0, len(grafo))
	peso := 0.0

	for idx, v := range grafo[:] {
		ciclo := ""
		if !uf.Cycle(v.Origen, v.Destino) {
			uf.Union(v.Origen, v.Destino)
			arbol = append(arbol, idx)
			peso += v.Peso

			camino += fmt.Sprintf("%s,%s,", v.Origen, v.Destino)
		} else {
			ciclo = v.Origen + v.Destino
		}

		links = append(links, GraphLink(grafo, camino, ciclo, false))
	}

	// This is to show the final graph more time.
	finalGraph := GraphLink(grafo, camino, "", false)
	for i := 0; i < 5; i += 1 {
		links = append(links, finalGraph)
	}

	return RespuestaKruskal{grafo, arbol, peso, links}
}

func GraphLink(nodos []Vertice, camino, ciclo string, dirigido bool) string {
	var link string
	var sep string

	if dirigido {
		link += "digraph{rankdir=LR;"
		sep = "->"
	} else {
		link += "graph{rankdir=LR;"
		sep = "--"
	}

	s := Set()
	caminos := strings.Split(camino, ",")

	for idx, camino := range caminos[:len(caminos)-1] {
		s.Add(fmt.Sprintf("%s%s", camino, caminos[idx+1]))
	}

	for _, n := range nodos[:] {
		link += fmt.Sprintf("%s%s%s", n.Origen, sep, n.Destino)
		link += fmt.Sprintf("[label=\"%.3f\"", n.Peso)

		if s.Contains(n.Origen + n.Destino) {
			link += ",color=blue,penwidth=3.0];"
		} else if (n.Origen + n.Destino) == ciclo {
			// Arista que forma un ciclo
			link += ",color=red,penwidth=3.2];"
		} else {
			link += "];"
		}
	}

	link += "}"

	return link
}
