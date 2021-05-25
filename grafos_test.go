package main

import (
	"encoding/json"
	"reflect"
	"sort"
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

		_, sol := ResuelveFloyWarshall(&grafo)

		if !reflect.DeepEqual(sol, correctSol) {
			t.Error("Respuesa incorrecta", correctSol, sol)
		}
	})

	t.Run("Ruta Crítica", func(t *testing.T) {
		const duracion float64 = 20.0
		ruta := []string{"D", "I", "J", "L", "M", "-"}

		_, clase := ResuelveCPM(&[]Vertice{
			{"A", "-", 2}, {"B", "A", 4}, {"C", "B", 1}, {"C", "H", 1},
			{"D", "-", 6}, {"E", "G", 3}, {"F", "E", 5}, {"G", "D", 2},
			{"H", "G", 2}, {"I", "D", 3}, {"J", "I", 4}, {"K", "D", 3},
			{"L", "J", 5}, {"L", "K", 5}, {"M", "C", 2}, {"M", "L", 2},
		})

		if clase.DuracionTotal != duracion {
			t.Error("Duración total erronea.")
		}

		sort.Strings(clase.RutaCritica)
		sort.Strings(ruta)

		if !reflect.DeepEqual(clase.RutaCritica, ruta) {
			t.Error("Ruta Critica erronea", clase.RutaCritica, ruta)
		}

		// 7
		ResuelveCPM(&[]Vertice{
			{"A", "-", 10},
			{"B", "-", 7},
			{"C", "A", 5},
			{"D", "C", 3},
			{"E", "D", 2},
			{"F", "B", 1},
			{"F", "E", 1},
			{"G", "E", 1},
			{"G", "F", 14},
		})

		// 10
		ResuelveCPM(&[]Vertice{
			{"A", "-", 3},
			{"B", "A", 14},
			{"C", "A", 1},
			{"D", "C", 3},
			{"E", "C", 1},
			{"F", "C", 2},
			{"G", "D", 1},
			{"G", "E", 1},
			{"G", "F", 1},
			{"H", "G", 1},
			{"I", "H", 3},
			{"J", "H", 2},
			{"K", "I", 2},
			{"K", "J", 2},
			{"L", "K", 2},
			{"M", "L", 4},
			{"N", "L", 1},
			{"O", "B", 3},
			{"O", "M", 3},
			{"O", "N", 3},
		})

		ResuelveCPM(&[]Vertice{
			{"a", "-", 5}, {"b", "-", 2},
			{"c", "a", 2}, {"d", "a", 3},
			{"e", "b", 1}, {"f", "c", 1},
			{"f", "d", 1}, {"g", "e", 4},
		})
	})
}
