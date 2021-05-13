package main

import "math"

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
		if e < mini {
			mini = e
		}
	}
	return mini
}
