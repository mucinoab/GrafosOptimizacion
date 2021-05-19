package main

import (
	"math"
)

// custom Hash Set
type Set struct {
	m map[string]struct{}
}

func set() *Set {
	return &Set{make(map[string]struct{})}
}

func (s *Set) Add(k string) {
	s.m[k] = struct{}{}
}

// various utilities

func Find(slice *[]camino, val camino) bool {
	for _, item := range *slice {
		if item == val {
			return true
		}
	}
	return false
}

func Pop(alist *[]camino) {
	f := len(*alist)
	*alist = append((*alist)[:f-1])
}

func Min(marcado *[]camino, grafo map[string]map[string]float64) float64 {
	mini := math.Inf(0)
	for _, v := range *marcado {
		e := grafo[v.izq][v.der]
		mini = math.Min(mini, e)
	}
	return mini
}

func VerticesToAdjList(grafo *[]Vertice, dirigido bool) map[string]map[string]float64 {
	adjList := make(map[string]map[string]float64)

	for _, a := range *grafo {
		if _, ok := adjList[a.Origen]; !ok {
			adjList[a.Origen] = make(map[string]float64)
		}

		adjList[a.Origen][a.Destino] = a.Peso

		if !dirigido {
			if _, ok := adjList[a.Destino]; !ok {
				adjList[a.Destino] = make(map[string]float64)
			}
			adjList[a.Destino][a.Origen] = a.Peso
		}
	}

	return adjList
}

func AdjListToVertices(grafo map[string]map[string]float64, dirigido bool) *[]Vertice {
	adjList := []Vertice{}

	for a, row := range grafo {
		for b, p := range row {
			adjList = append(adjList, Vertice{a, b, p})

			if !dirigido {
				adjList = append(adjList, Vertice{b, a, p})
			}
		}
	}

	return &adjList
}
