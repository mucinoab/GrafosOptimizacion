package main

import (
	"fmt"
	"math"
)

var inf = math.Inf(0)
var ninf = math.Inf(-1)

type Nodo struct {
	P, Lhs, Rhs float64
}

func NewNodo(p float64) *Nodo {
	return &Nodo{p, ninf, ninf}
}

func ResuelveCPM(p *[]Vertice) []byte {
	//  anterior := VerticesToAdjList(p, true)
	actividades := make(map[string]*Nodo, len(*p))
	actividades["-"] = &Nodo{0, 0, 0}
	s := set()
	sn := set()

	for idx := 0; idx < len(*p); idx += 1 {
		actividades[(*p)[idx].Origen] = NewNodo((*p)[idx].Peso)

		s.Add((*p)[idx].Origen)
		// Invertimos porque el formato de la tabla es distinto
		(*p)[idx].Origen, (*p)[idx].Destino = (*p)[idx].Destino, (*p)[idx].Origen
		s.Add((*p)[idx].Origen)
		sn.Add((*p)[idx].Origen)
	}

	s.SymmetricDifference(sn)
	siguiente := VerticesToAdjList(p, true)
	Dfs("-", siguiente, actividades, set())

	for n, v := range actividades {
		fmt.Println(n, *v)
	}

	return make([]byte, 0)
}

func Dfs(anterior string, s map[string]map[string]float64, n map[string]*Nodo, v *Set) {
	peso := n[anterior].Rhs

	for vecino := range s[anterior] {
		if n[vecino].Lhs < peso {
			n[vecino].Lhs = peso
			n[vecino].Rhs = n[vecino].P + peso
			Dfs(vecino, s, n, v)
		}
	}
}
