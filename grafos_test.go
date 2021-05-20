package main

import (
	"encoding/json"
	"reflect"
	"testing"
)

func TestGrafos(t *testing.T) {
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

		if err := json.Unmarshal(sol, &f); err != nil {
			t.Error("Error al deserealizar.")
		}

		if f.Flujo != 20.00 {
			t.Errorf("Flujo máximo incorrecto, obtuve %.2f, esperaba 20.00", f.Flujo)
		}
	})

	t.Run("Floyd-Warshall", func(t *testing.T) {
		grafo := []Vertice{
			{"1", "2", 700}, {"1", "3", 200},
			{"2", "3", 300}, {"2", "4", 200},
			{"2", "6", 400}, {"3", "4", 700},
			{"3", "5", 600}, {"4", "6", 100},
			{"4", "5", 300}, {"6", "5", 500},
		}

		correctSol := map[string]map[string]float64{
			"1": {"1": 0, "2": 500, "3": 200, "4": 700, "5": 800, "6": 800},
			"2": {"1": 500, "2": 0, "3": 300, "4": 200, "5": 500, "6": 300},
			"3": {"1": 200, "2": 300, "3": 0, "4": 500, "5": 600, "6": 600},
			"4": {"1": 700, "2": 200, "3": 500, "4": 0, "5": 300, "6": 100},
			"5": {"1": 800, "2": 500, "3": 600, "4": 300, "5": 0, "6": 400},
			"6": {"1": 800, "2": 300, "3": 600, "4": 100, "5": 400, "6": 0},
		}

		_, sol := ResuelveFloyWarshall(grafo)

		if !reflect.DeepEqual(sol, correctSol) {
			t.Error("Respuesa incorrecta", correctSol, sol)
		}
	})
}
