package main

import (
	"compress/gzip"
	"encoding/json"
	"io"
	"io/ioutil"
	"log"
	"math"
	"math/rand"
	"net/http"
	"sort"
	"strings"
	"time"
)

const Inf = math.MaxFloat64
const NInf = -math.MaxFloat64
const jsMaxValue = 1.7976931348623157e+308
const epsilon = 0.05

type Vertice struct {
	Origen  string  `json:"origen"`
	Destino string  `json:"destino"`
	Peso    float64 `json:"peso"`
}

type adjlist map[string]map[string]float64

// Custom Hash Set
type Set struct {
	m map[string]struct{}
}

func set() *Set {
	return &Set{make(map[string]struct{})}
}
func (s *Set) Len() int {
	return len(s.m)
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

// Union find utilities

type UnionFind map[string]string

func NewUnionFind(g []Vertice) *UnionFind {
	uf := make(UnionFind, len(g)*2)

	for _, v := range g[:] {
		uf[v.Origen] = v.Origen
		uf[v.Destino] = v.Destino
	}

	return &uf
}

func (u UnionFind) Parent(nodo string) string {
	if u[nodo] != nodo {
		u[nodo] = u.Parent(u[nodo])
	}
	return u[nodo]
}

func (u UnionFind) Cycle(a, b string) bool {
	a = u.Parent(a)
	b = u.Parent(b)

	return a == b
}

func (u UnionFind) Union(a, b string) {
	a = u.Parent(a)
	b = u.Parent(b)

	if a != b {
		if rand.Float64() > 0.5 {
			u[a] = b
		} else {
			u[b] = a
		}
	}
}

// Misc utilities

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
	*alist = (*alist)[:f-1]
}

func Min(marcado *[]camino, grafo map[string]map[string]float64) float64 {
	mini := Inf
	for _, v := range *marcado {
		e := grafo[v.izq][v.der]
		mini = math.Min(mini, e)
	}
	return mini
}

// TODO
// hacer parametros variables para tener una sola funcion Min
func Min_child(arr map[string]float64) string {
	mini := Inf
	nodo := ""
	for child, v := range arr {
		if mini > v {
			mini = v
			nodo = child
		}
	}
	return nodo
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

// Compression stuff

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
		defer duration(track(r.URL.String()))
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

// Serialize

func toBytes(someStruct interface{}) []byte {
	s, err := json.Marshal(someStruct)

	// TODO proper error handling
	if err != nil {
		log.Println(err)
		return make([]byte, 0)
	} else {
		return s
	}
}

func deserialize(rawData io.ReadCloser, v interface{}) {
	// TODO proper error handling
	d, err := ioutil.ReadAll(rawData)
	if err != nil {
		log.Print(err)
	}

	err = json.Unmarshal(d, v)

	if err != nil {
		log.Print(err)
	}
}

// Log Time

func track(msg string) (string, time.Time) {
	return msg, time.Now()
}

func duration(msg string, start time.Time) {
	log.Printf("%-15s %dμs", msg, time.Since(start).Microseconds())
}
