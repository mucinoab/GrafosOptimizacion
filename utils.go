package main

import (
	"compress/gzip"
	"io"
	"math"
	"net/http"
	"sort"
	"strings"
)

const Inf = math.MaxFloat64
const NInf = -math.MaxFloat64
const epsilon = 0.05

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

// source https://gist.github.com/the42/1956518
type gzipResponseWriter struct {
	io.Writer
	http.ResponseWriter
}

func (w gzipResponseWriter) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

func gzipHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			h.ServeHTTP(w, r)
			return
		}
		w.Header().Set("Content-Encoding", "gzip")
		gz := gzip.NewWriter(w)
		defer gz.Close()
		h.ServeHTTP(gzipResponseWriter{Writer: gz, ResponseWriter: w}, r)
	})
}
