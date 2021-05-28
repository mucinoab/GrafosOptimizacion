package main

import (
	"bytes"
	"compress/gzip"
	"log"
	"math"
	"net/http"
	"sort"
)

const Inf = math.MaxFloat64
const NInf = -math.MaxFloat64

type Vertice struct {
	Origen  string  `json:"origen"`
	Destino string  `json:"destino"`
	Peso    float64 `json:"peso"`
}

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

func (s *Set) Contains(k string) bool {
	_, c := s.m[k]

	return c
}

func (s *Set) toSlice() *[]string {
	sl := make([]string, 0, len(s.m))

	for node := range s.m {
		sl = append(sl, node)
	}

	sort.Strings(sl)

	return &sl
}

// Values that are in s or in sn but not in both
func (s *Set) SymmetricDifference(sn *Set) *Set {
	newS := set()

	for i := range s.m {
		if !sn.Contains(i) {
			newS.Add(i)
		}
	}

	for i := range sn.m {
		if !s.Contains(i) {
			newS.Add(i)
		}
	}

	return newS
}

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
	mini := Inf
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

// Compresión con gzip
func gzipF(a *[]byte, rw *http.ResponseWriter) []byte {
	var b bytes.Buffer
	gz := gzip.NewWriter(&b)

	if _, err := gz.Write(*a); err != nil {
		log.Print(err)
	}
	gz.Close()

	(*rw).Header().Set("Content-Type", "application/json")
	(*rw).Header().Set("Content-Encoding", "gzip")

	return b.Bytes()
}
