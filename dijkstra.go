package main

import (
    "fmt"
)
type dijkstra struct{
    Origen  string    `json:"origen"`
    Destino string    `json:"destino"`
    Grafo []Vertice   `json:"grafo"`
}
type coor struct {
    row int32 `json:"row"`
    col int32  `json:"col"` 
}
type dijkstraRespuesta struct{
    Tabla   [][]string `json:"tabla"`
    Destino string   `json:"destino"`
    Origen  string   `json:"origen"`
    Peso    float64    `json:"peso"`
    Bases   []string   `json:"bases"`
    Coords  []coor      `json:"coords"`
}
func ResuelveDijkstra(g dijkstra) dijkstraRespuesta{
    grafo := VerticesToAdjList(&g.Grafo, true)
    origen := g.Origen

    Mapeo := map[string]int{}
    Mapeo2 := map[int]string{}
    lista := BFS(grafo, origen)
    fmt.Printf("%v \n",lista)
    numeroNodos := len(lista)
    for i := 0 ; i < len(lista) ; i ++ {
        Mapeo[lista[i]] = i
        Mapeo2[i] = lista[i]
    }

    Tabla := make([][]float64, numeroNodos)
    TablaString := make([][]string, numeroNodos + 2)

    Max := Inf
    for i := range Tabla {
        Tabla[i] = make([]float64, numeroNodos)
        TablaString[i] = make([]string, numeroNodos + 2)
        for idx := 0 ;idx < numeroNodos;idx++  {
            Tabla[i][idx] = Max
            TablaString[i][idx] = "M"
        }
    }
    base := origen

    Tabla[0][0] = 0
    TablaString[0][0] ="0"
    TablaString[0][numeroNodos] = origen
    TablaString[0][numeroNodos + 1] = "-"
    min ,min2,aux,pesoAns := 0.0,Max, "", 0.0
    vis  := set()
    Bases := make([]string,0)
    CoordBases := make([]coor,0)
    Bases = append(Bases, origen)
    vis.Add(origen)

    for i := 1 ; i < numeroNodos ;i ++{
        for j := 0 ; j < numeroNodos;j++ {
            val ,ok := grafo[base][Mapeo2[j]]
            marcado := vis.Contains(Mapeo2[j])

            if ok && Tabla[i-1][j] >  val  + min  && !marcado {
                Tabla[i][j] = val+ min
            }else{
                if marcado {
                    Tabla[i][j] =   -1.0
                }else{
                    Tabla[i][j] = Tabla[i - 1][j]
                }
            }

            if !marcado {
                if Tabla[i][j] == Max{
                    TablaString[i][j] = "M"
                }else{
                    TablaString[i][j] = fmt.Sprintf("%.2f",Tabla[i][j])
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
        if base == g.Destino {
            pesoAns = min2
        }
        vis.Add(base)

        Bases = append(Bases, base)
        TablaString[i][numeroNodos] = base
        min =  Tabla[i][Mapeo[base]]
        CoordBases = append( CoordBases,coor {
            row : int32(i),
            col : int32(Mapeo[base]),
                })
        TablaString[i][numeroNodos + 1] = Arcos(Tabla, Mapeo[base],i,min,Mapeo2)
        min2 = Max
    }

    ans := dijkstraRespuesta{
        Tabla : TablaString,
        Destino : g.Destino,
        Origen  : g.Origen,
        Peso    : pesoAns,
        Bases   : Bases,
        Coords  : CoordBases,
    }

    return ans
}

func BFS(adj adjlist, origen string ) []string {
    q := []string{}
    lista := []string{}
    q = append(q, origen)
    lista = append(lista, origen)
    visitado := map[string]bool{}
    for len(q) > 0 {
        actual := q[0];
        q = q[1:]
        for hijo, _ := range adj[actual] {
            if visitado[hijo] == false {
                lista = append(lista, hijo)
                q = append(q, hijo)
                visitado[hijo] = true
            }
        }
    }
    return lista
}
func Arcos ( Tabla [][]float64 , col int, row int,val float64,Mapeo map[int]string) string {
    aux := row
    for aux >= 0 {
       if  Tabla[aux][col] != val {
           return fmt.Sprintf("{ %s %s }", Mapeo[aux] , Mapeo[row])
       }
       aux -=1
    }
    return "-"
}
