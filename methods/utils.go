package methods

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
const Epsilon = 0.05

type Edge struct {
	Source string  `json:"origen"`
	Target string  `json:"destino"`
	Weight float64 `json:"peso"`
}

type adjList map[string]map[string]float64

// Custom Hash Set
type set map[string]struct{}

func Set() set {
	return set{}
}

func (s set) Add(k string) {
	s[k] = struct{}{}
}

func (s set) Contains(k string) bool {
	_, c := s[k]

	return c
}

func (s set) toSlice() *[]string {
	sl := make([]string, 0, len(s))

	for node := range s {
		sl = append(sl, node)
	}

	sort.Strings(sl)

	return &sl
}

// Values that are in s or in sn but not in both
func (s set) SymmetricDifference(sn set) set {
	newS := Set()

	for i := range s {
		if !sn.Contains(i) {
			newS.Add(i)
		}
	}

	for i := range sn {
		if !s.Contains(i) {
			newS.Add(i)
		}
	}

	return newS
}

// Union find utilities

type UnionFind map[string]string

func NewUnionFind(g []Edge) *UnionFind {
	uf := make(UnionFind, len(g)*2)

	for _, v := range g[:] {
		uf[v.Source] = v.Source
		uf[v.Target] = v.Target
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

func Find(slice *[]Camino, val Camino) bool {
	for _, item := range *slice {
		if item == val {
			return true
		}
	}
	return false
}

func Pop(alist *[]Camino) {
	f := len(*alist)
	*alist = (*alist)[:f-1]
}

func Min(marcado *[]Camino, grafo adjList) float64 {
	mini := Inf
	for _, v := range *marcado {
		e := grafo[v.izq][v.der]
		mini = math.Min(mini, e)
	}
	return mini
}

func MinChild(arr map[string]float64) string {
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

func VerticesToAdjList(grafo *[]Edge, dirigido bool) map[string]map[string]float64 {
	adjList := make(adjList)

	for _, a := range *grafo {
		if _, ok := adjList[a.Source]; !ok {
			adjList[a.Source] = make(map[string]float64)
		}

		adjList[a.Source][a.Target] = a.Weight

		if !dirigido {
			if _, ok := adjList[a.Target]; !ok {
				adjList[a.Target] = make(map[string]float64)
			}
			adjList[a.Target][a.Source] = a.Weight
		}
	}

	return adjList
}

func AdjListToVertices(grafo adjList, dirigido bool) *[]Edge {
	adjList := []Edge{}

	for a, row := range grafo {
		for b, p := range row {
			adjList = append(adjList, Edge{a, b, p})

			if !dirigido {
				adjList = append(adjList, Edge{b, a, p})
			}
		}
	}

	return &adjList
}

// Compression stuff

// source https://gist.github.com/the42/1956518
type GzipResponseWriter struct {
	io.Writer
	http.ResponseWriter
}

func (w GzipResponseWriter) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

func GzipHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer duration(track(r.URL.String()))
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			h.ServeHTTP(w, r)
			return
		}

		w.Header().Set("Cache-Control", "max-age=3600")
		w.Header().Set("Content-Encoding", "gzip")
		gz := gzip.NewWriter(w)
		defer gz.Close()
		h.ServeHTTP(GzipResponseWriter{Writer: gz, ResponseWriter: w}, r)
	})
}

// Serialize

func ToBytes(someStruct interface{}) []byte {
	s, err := json.Marshal(someStruct)

	if err != nil {
		log.Panic(someStruct, err)
	}

	return s
}

func Deserialize(rawData io.ReadCloser, v interface{}) {
	d, err := ioutil.ReadAll(rawData)

	if err != nil {
		log.Panic(rawData, err)
	}

	err = json.Unmarshal(d, v)

	if err != nil {
		log.Panic(d, err)
	}
}

// Log Time

func track(msg string) (string, time.Time) {
	return msg, time.Now()
}

func duration(msg string, start time.Time) {
	log.Printf("%-15s %dμs", msg, time.Since(start).Microseconds())
}
