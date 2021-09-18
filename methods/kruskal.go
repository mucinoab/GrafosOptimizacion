package methods

import (
	"fmt"
	"sort"
	"strings"
)

type RespuestaKruskal struct {
	Grafo  []Edge   `json:"grafo"`
	Arbol  []int    `json:"arbol"`
	Peso   float64  `json:"peso"`
	Graphs []string `json:"graphs"`
}

func ResuelveKruskal(grafo []Edge) RespuestaKruskal {
	sort.Slice(grafo, func(i, j int) bool { return grafo[i].Weight < grafo[j].Weight })

	links := make([]string, 0, len(grafo)+2)
	camino := ""

	links = append(links, GraphLink(grafo, camino, "", false))

	uf := NewUnionFind(grafo)
	arbol := make([]int, 0, len(grafo))
	peso := 0.0

	for idx, v := range grafo[:] {
		ciclo := ""
		if !uf.Cycle(v.Source, v.Target) {
			uf.Union(v.Source, v.Target)
			arbol = append(arbol, idx)
			peso += v.Weight

			camino += fmt.Sprintf("%s,%s,", v.Source, v.Target)
		} else {
			ciclo = v.Source + v.Target
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

func GraphLink(nodos []Edge, camino, ciclo string, dirigido bool) string {
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
		link += fmt.Sprintf("%s%s%s", n.Source, sep, n.Target)
		link += fmt.Sprintf("[label=\"%.3f\"", n.Weight)

		if s.Contains(n.Source + n.Target) {
			link += ",color=blue,penwidth=3.0];"
		} else if (n.Source + n.Target) == ciclo {
			// Arista que forma un ciclo
			link += ",color=red,penwidth=3.2];"
		} else {
			link += "];"
		}
	}

	link += "}"

	return link
}
