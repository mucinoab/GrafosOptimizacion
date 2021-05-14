package main

import (
	"encoding/json"
	"testing"
)

func TestWallet(t *testing.T) {
	t.Run("Flujo Máximo", func(t *testing.T) {
		grafo := FlujoMaximo{
			Grafo: []Vertice{
				{"bilbao", "s1", 4},
				{"bilbao", "s2", 1},
				{"barcelona", "s1", 2},
				{"barcelona", "s2", 3},
				{"sevilla", "s1", 2},
				{"sevilla", "s2", 2},
				{"sevilla", "s3", 3},
				{"valencia", "s2", 2},
				{"zaragoza", "s2", 3},
				{"zaragoza", "s3", 1},
				{"origen", "bilbao", 7},
				{"origen", "barcelona", 5},
				{"origen", "sevilla", 7},
				{"origen", "zaragoza", 6},
				{"origen", "valencia", 2},
				{"s1", "madrid", 8},
				{"s2", "madrid", 8},
				{"s3", "madrid", 8},
			},
			Origen:   "origen",
			Destino:  "madrid",
			Dirigido: true,
		}

		sol := ResuelveFlujoMaximo(grafo)
		var f RespuestaFlujoMaximo

		if err := json.Unmarshal([]byte(sol), &f); err != nil {
			t.Error("Error al deserealizar.")
		}

		if f.Flujo != 20.00 {
			t.Errorf("Flujo máximo incorrecto, obtuve %.2f, esperaba 20.00", f.Flujo)
		}
	})
}
