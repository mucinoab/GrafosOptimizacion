package methods

import "fmt"

type Dijkstra struct {
	Origen  string    `json:"origen"`
	Destino string    `json:"destino"`
	Grafo   []Vertice `json:"grafo"`
}

type coor struct {
	Row int `json:"row"`
	Col int `json:"col"`
}

type DijkstraRespuesta struct {
	Tabla   [][]string `json:"tabla"`
	Destino string     `json:"destino"`
	Origen  string     `json:"origen"`
	Peso    float64    `json:"peso"`
	Bases   []string   `json:"bases"`
	Coords  []coor     `json:"coords"`
}

func ResuelveDijkstra(g Dijkstra) DijkstraRespuesta {
	grafo := VerticesToAdjList(&g.Grafo, true)
	lista := BFS(grafo, g.Origen)
	numeroNodos := len(lista)

	Mapeo := make(map[string]int, numeroNodos)
	Mapeo2 := make(map[int]string, numeroNodos)

	for idx, li := range lista[:] {
		Mapeo[li] = idx
		Mapeo2[idx] = li
	}

	Tabla := make([][]float64, numeroNodos)
	TablaString := make([][]string, numeroNodos+2)

	for i := range Tabla {
		Tabla[i] = make([]float64, numeroNodos)
		TablaString[i] = make([]string, numeroNodos+2)

		for idx := range Tabla[i][:] {
			Tabla[i][idx] = Inf
			TablaString[i][idx] = "∞"
		}
	}

	Tabla[0][0] = 0
	TablaString[0][0] = "0"
	TablaString[0][numeroNodos] = g.Origen
	TablaString[0][numeroNodos+1] = "-"

	min, min2, aux, pesoAns := 0.0, Inf, "", 0.0
	CoordBases := make([]coor, 0)

	vis := Set()
	vis.Add(g.Origen)

	base := g.Origen

	for i := 1; i < numeroNodos; i++ {
		for j := 0; j < numeroNodos; j++ {
			val, ok := grafo[base][Mapeo2[j]]
			marcado := vis.Contains(Mapeo2[j])

			if ok && Tabla[i-1][j] > val+min && !marcado {
				Tabla[i][j] = val + min
			} else {
				if marcado {
					Tabla[i][j] = -1.0
				} else {
					Tabla[i][j] = Tabla[i-1][j]
				}
			}

			if !marcado {
				if Tabla[i][j] == Inf {

					TablaString[i][j] = "∞"
				} else {
					TablaString[i][j] = fmt.Sprintf("%.2f", Tabla[i][j])
				}
			} else {
				TablaString[i][j] = "-"
			}

			if Tabla[i][j] < min2 && !marcado {
				min2 = Tabla[i][j]
				aux = Mapeo2[j]
			}
		}

		base = aux
		vis.Add(base)

		if base == g.Destino {
			pesoAns = min2
		}

		min = Tabla[i][Mapeo[base]]
		min2 = Inf

		CoordBases = append(CoordBases, coor{i, Mapeo[base]})

		TablaString[i][numeroNodos+1] = Arcos(Tabla, i, Mapeo[base], min, Mapeo2, TablaString, numeroNodos)
		TablaString[i][numeroNodos] = base
	}

	return DijkstraRespuesta{
		Tabla:   TablaString,
		Destino: g.Destino,
		Origen:  g.Origen,
		Peso:    pesoAns,
		Bases:   lista,
		Coords:  CoordBases,
	}
}

func BFS(adj adjList, origen string) []string {
	q := []string{origen}
	lista := []string{origen}
	visitado := Set()

	for len(q) > 0 {
		actual := q[0]
		q = q[1:]

		for hijo := range adj[actual] {
			if !visitado.Contains(hijo) {
				visitado.Add(hijo)

				lista = append(lista, hijo)
				q = append(q, hijo)
			}
		}
	}

	return lista
}

func Arcos(Tabla [][]float64, row int, col int, val float64, Mapeo map[int]string, TablaString [][]string, numeroNodos int) string {
	for row >= 0 {
		if Tabla[row][col] != val {
			return fmt.Sprintf("{ %s, %s }", TablaString[row][numeroNodos], Mapeo[col])

		}
		row -= 1
	}

	return "-"
}
