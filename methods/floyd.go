package methods

type RespuestaFloydWarshall struct {
	Cambios     []Cambio `json:"cambios"`
	Iteraciones [][]Edge `json:"iteraciones"`
	Nodos       []string `json:"nodos"`
}

// En qué iteración ocurrió una mejora
type Cambio struct {
	Iter    int64  `json:"iteracion"`
	Origen  string `json:"origen"`
	Destino string `json:"destino"`
}

// TODO matriz de cambios rara
func ResuelveFloyWarshall(grafo *[]Edge) RespuestaFloydWarshall {
	sol := VerticesToAdjList(grafo, false)
	nodos := Set()

	for _, v := range *grafo {
		nodos.Add(v.Source)
		nodos.Add(v.Target)
	}

	for origen := range nodos.m {
		for destino := range nodos.m {
			if origen == destino {
				// Distancia a ti mismo
				sol[origen][destino] = 0
				sol[destino][origen] = 0
			} else {
				// Nodos sin conexión directa
				if _, ok := sol[origen][destino]; !ok {
					sol[origen][destino] = Inf
				}
				if _, ok := sol[destino][origen]; !ok {
					sol[destino][origen] = Inf
				}
			}
		}
	}

	var iteracion int64
	var aux float64
	iteraciones := make([][]Edge, len(nodos.m)+1)
	cambios := []Cambio{}

	for puente := range nodos.m {
		// TODO grafos no dirigidos
		iteraciones[iteracion] = *AdjListToVertices(sol, true)
		iteracion += 1

		for origen := range sol {
			for destino := range sol {
				aux = sol[origen][puente] + sol[destino][puente]

				if sol[origen][destino] > aux {
					cambios = append(cambios, Cambio{iteracion, origen, destino})
					sol[origen][destino] = aux
				}
			}
		}
	}

	// producto final
	iteraciones[iteracion] = *AdjListToVertices(sol, true)

	// necesitamos quitar los infinitos porque no se pueden serializar en JSON,
	// se remplazan por "Number.MAX_VALUE", el valor más grande que puede
	// representar JavaScript
	for _, iter := range iteraciones {
		for idx, v := range iter {
			if v.Weight == Inf {
				iter[idx].Weight = jsMaxValue
			}
		}
	}

	return RespuestaFloydWarshall{cambios, iteraciones, *nodos.toSlice()}
}
