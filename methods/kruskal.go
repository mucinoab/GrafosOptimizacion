// Package methods TODO
package methods

import (
	"fmt"
	"sort"
	"strings"
)

type Kruskal struct {
	Graph  []Edge   `json:"graph"`
	Tree   []int    `json:"tree"`
	Weight float64  `json:"weight"`
	Graphs []string `json:"graphs"`
}

func ResuelveKruskal(grafo []Edge) Kruskal {
	sort.Slice(grafo, func(i, j int) bool { return grafo[i].Weight < grafo[j].Weight })

	links := make([]string, 0, len(grafo)+8)
	links = append(links, DotGraphGenerator(grafo, "", "", false))

	uf := NewUnionFind(grafo)
	arbol := make([]int, 0, len(grafo))
	var peso float64
	var camino strings.Builder

	for idx, v := range grafo[:] {
		ciclo := ""
		if uf.Cycle(v.Source, v.Target) {
			ciclo = v.Source + v.Target
		} else {
			uf.Union(v.Source, v.Target)
			arbol = append(arbol, idx)
			peso += v.Weight

			fmt.Fprintf(&camino, "%s,%s,", v.Source, v.Target)
		}

		links = append(links, DotGraphGenerator(grafo, camino.String(), ciclo, false))
	}

	// This is to show the final graph more time.
	finalGraph := DotGraphGenerator(grafo, camino.String(), "", false)
	for i := 0; i < 5; i += 1 {
		links = append(links, finalGraph)
	}

	return Kruskal{grafo, arbol, peso, links}
}

func DotGraphGenerator(nodos []Edge, camino, ciclo string, dirigido bool) string {
	var graph strings.Builder
	var sep string

	if dirigido {
		graph.WriteString("digraph{rankdir=LR;")
		sep = "->"
	} else {
		graph.WriteString("graph{rankdir=LR;")
		sep = "--"
	}

	s := Set()
	caminos := strings.Split(camino, ",")

	for idx, camino := range caminos[:len(caminos)-1] {
		s.Add(camino + caminos[idx+1])
	}

	for _, n := range nodos[:] {
		fmt.Fprintf(&graph, "%s%s%s", n.Source, sep, n.Target)
		fmt.Fprintf(&graph, "[label=\"%.3f\"", n.Weight)

		if s.Contains(n.Source + n.Target) {
			graph.WriteString(",color=blue,penwidth=3.0];")
		} else if (n.Source + n.Target) == ciclo {
			// Arista que forma un ciclo
			graph.WriteString(",color=red,penwidth=3.2];")
		} else {
			graph.WriteString("];")
		}
	}

	graph.WriteRune('}')

	return graph.String()
}
