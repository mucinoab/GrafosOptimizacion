package methods

import (
	"math"
	"reflect"
	"sort"
	"testing"
)

func testAbsoluteError(v, e float64, t *testing.T) {
	if math.Abs(v-e) > Epsilon {
		t.Errorf("Wrong answer, expected: %f, got: %f", e, v)
	}
}

func TestGrafos(t *testing.T) {
	t.Run("Flujo Máximo", func(t *testing.T) {
		grafo := FlujoMaximo{
			Grafo: []Edge{
				{Source: "bilbao", Target: "s1", Weight: 4},
				{Source: "bilbao", Target: "s2", Weight: 1},
				{Source: "barcelona", Target: "s1", Weight: 2},
				{Source: "barcelona", Target: "s2", Weight: 3},
				{Source: "sevilla", Target: "s1", Weight: 2},
				{Source: "sevilla", Target: "s2", Weight: 2},
				{Source: "sevilla", Target: "s3", Weight: 3},
				{Source: "valencia", Target: "s2", Weight: 2},
				{Source: "zaragoza", Target: "s2", Weight: 3},
				{Source: "zaragoza", Target: "s3", Weight: 1},
				{Source: "origen", Target: "bilbao", Weight: 7},
				{Source: "origen", Target: "barcelona", Weight: 5},
				{Source: "origen", Target: "sevilla", Weight: 7},
				{Source: "origen", Target: "zaragoza", Weight: 6},
				{Source: "origen", Target: "valencia", Weight: 2},
				{Source: "s1", Target: "madrid", Weight: 8},
				{Source: "s2", Target: "madrid", Weight: 8},
				{Source: "s3", Target: "madrid", Weight: 8},
			},
			Origen:   "origen",
			Destino:  "madrid",
			Dirigido: true,
		}

		testAbsoluteError(ResuelveFlujoMaximo(grafo).Flujo, 20.00, t)
	})

	t.Run("Floyd-Warshall", func(t *testing.T) {
		grafo := []Edge{
			{Source: "1", Target: "2", Weight: 700}, {Source: "1", Target: "3", Weight: 200},
			{Source: "2", Target: "3", Weight: 300}, {Source: "2", Target: "4", Weight: 200},
			{Source: "2", Target: "6", Weight: 400}, {Source: "3", Target: "4", Weight: 700},
			{Source: "3", Target: "5", Weight: 600}, {Source: "4", Target: "6", Weight: 100},
			{Source: "4", Target: "5", Weight: 300}, {Source: "6", Target: "5", Weight: 500},
		}

		correctSol := map[string]map[string]float64{
			"1": {"1": 0, "2": 500, "3": 200, "4": 700, "5": 800, "6": 800},
			"2": {"1": 500, "2": 0, "3": 300, "4": 200, "5": 500, "6": 300},
			"3": {"1": 200, "2": 300, "3": 0, "4": 500, "5": 600, "6": 600},
			"4": {"1": 700, "2": 200, "3": 500, "4": 0, "5": 300, "6": 100},
			"5": {"1": 800, "2": 500, "3": 600, "4": 300, "5": 0, "6": 400},
			"6": {"1": 800, "2": 300, "3": 600, "4": 100, "5": 400, "6": 0},
		}

		solution := ResuelveFloyWarshall(&grafo)
		sol := VerticesToAdjList(&solution.Iteraciones[len(solution.Iteraciones)-1], true)

		if !reflect.DeepEqual(sol, correctSol) {
			t.Error("Respuesa incorrecta", correctSol, sol)
		}
	})

	t.Run("Ruta Crítica", func(t *testing.T) {
		const duracion float64 = 20.0
		ruta := []string{"D", "I", "J", "L", "M", "-", "Fin"}

		clase := ResuelveCPM([]Edge{
			{Source: "A", Target: "-", Weight: 2}, {Source: "B", Target: "A", Weight: 4},
			{Source: "C", Target: "B", Weight: 1}, {Source: "C", Target: "H", Weight: 1},
			{Source: "D", Target: "-", Weight: 6}, {Source: "E", Target: "G", Weight: 3},
			{Source: "F", Target: "E", Weight: 5}, {Source: "G", Target: "D", Weight: 2},
			{Source: "H", Target: "G", Weight: 2}, {Source: "I", Target: "D", Weight: 3},
			{Source: "J", Target: "I", Weight: 4}, {Source: "K", Target: "D", Weight: 3},
			{Source: "L", Target: "J", Weight: 5}, {Source: "L", Target: "K", Weight: 5},
			{Source: "M", Target: "C", Weight: 2}, {Source: "M", Target: "L", Weight: 2},
		})

		if clase.DuracionTotal != duracion {
			t.Error("Duración total errónea.")
		}

		sort.Strings(clase.RutaCritica)
		sort.Strings(ruta)

		if !reflect.DeepEqual(clase.RutaCritica, ruta) {
			t.Error("Ruta Critica errónea.", clase.RutaCritica, ruta)
		}

		ResuelveCPM([]Edge{
			{Source: "A", Target: "-", Weight: 10}, {Source: "B", Target: "-", Weight: 7},
			{Source: "C", Target: "A", Weight: 5}, {Source: "D", Target: "C", Weight: 3},
			{Source: "E", Target: "D", Weight: 2}, {Source: "F", Target: "B", Weight: 1},
			{Source: "F", Target: "E", Weight: 1}, {Source: "G", Target: "E", Weight: 1},
			{Source: "G", Target: "F", Weight: 14},
		})

		ResuelveCPM([]Edge{
			{Source: "A", Target: "-", Weight: 3}, {Source: "B", Target: "A", Weight: 14},
			{Source: "C", Target: "A", Weight: 1}, {Source: "D", Target: "C", Weight: 3},
			{Source: "E", Target: "C", Weight: 1}, {Source: "F", Target: "C", Weight: 2},
			{Source: "G", Target: "D", Weight: 1}, {Source: "G", Target: "E", Weight: 1},
			{Source: "G", Target: "F", Weight: 1}, {Source: "H", Target: "G", Weight: 1},
			{Source: "I", Target: "H", Weight: 3}, {Source: "J", Target: "H", Weight: 2},
			{Source: "K", Target: "I", Weight: 2}, {Source: "K", Target: "J", Weight: 2},
			{Source: "L", Target: "K", Weight: 2}, {Source: "M", Target: "L", Weight: 4},
			{Source: "N", Target: "L", Weight: 1}, {Source: "O", Target: "B", Weight: 3},
			{Source: "O", Target: "M", Weight: 3}, {Source: "O", Target: "N", Weight: 3},
		})

		ResuelveCPM([]Edge{
			{Source: "a", Target: "-", Weight: 5},
			{Source: "b", Target: "-", Weight: 2},
			{Source: "c", Target: "a", Weight: 2},
			{Source: "d", Target: "a", Weight: 3},
			{Source: "e", Target: "b", Weight: 1},
			{Source: "f", Target: "c", Weight: 1},
			{Source: "f", Target: "d", Weight: 1},
			{Source: "g", Target: "e", Weight: 4},
		})
	})

	t.Run("PERT", func(t *testing.T) {
		ejemplo := []VerticePert{
			{Actividad: "A", Predecesora: "-", Optimista: 1, Probable: 2, Pesimista: 3},
			{Actividad: "B", Predecesora: "A", Optimista: 2, Probable: 4, Pesimista: 6},
			{Actividad: "C", Predecesora: "B", Optimista: 0, Probable: 1, Pesimista: 2},
			{Actividad: "C", Predecesora: "H", Optimista: 0, Probable: 1, Pesimista: 2},
			{Actividad: "D", Predecesora: "-", Optimista: 3, Probable: 6, Pesimista: 9},
			{Actividad: "E", Predecesora: "G", Optimista: 2, Probable: 3, Pesimista: 4},
			{Actividad: "F", Predecesora: "E", Optimista: 3, Probable: 5, Pesimista: 7},
			{Actividad: "G", Predecesora: "D", Optimista: 1, Probable: 2, Pesimista: 3},
			{Actividad: "H", Predecesora: "G", Optimista: 1, Probable: 2, Pesimista: 3},
			{Actividad: "I", Predecesora: "D", Optimista: 1, Probable: 3, Pesimista: 5},
			{Actividad: "J", Predecesora: "I", Optimista: 3, Probable: 4, Pesimista: 5},
			{Actividad: "K", Predecesora: "D", Optimista: 2, Probable: 3, Pesimista: 4},
			{Actividad: "L", Predecesora: "J", Optimista: 3, Probable: 5, Pesimista: 7},
			{Actividad: "L", Predecesora: "K", Optimista: 3, Probable: 5, Pesimista: 7},
			{Actividad: "M", Predecesora: "C", Optimista: 1, Probable: 2, Pesimista: 3},
			{Actividad: "M", Predecesora: "L", Optimista: 1, Probable: 2, Pesimista: 3},
		}

		clase := ResuelvePERT(ejemplo)

		testAbsoluteError(clase.Media, 20.0, t)
		testAbsoluteError(clase.SumaVariazas, 19.0/9.0, t)
	})

	t.Run("Compresion", func(t *testing.T) {
		ejemplo := CompresionData{
			TiempoObjetivo: -1,
			Actividades: []VerticeCompresion{
				{Actividad: "A", Predecesora: "-", PesoNormal: 8, CostoNormal: 100, PesoUrgente: 6, CostoUrgente: 200},
				{Actividad: "B", Predecesora: "-", PesoNormal: 4, CostoNormal: 150, PesoUrgente: 2, CostoUrgente: 350},
				{Actividad: "C", Predecesora: "A", PesoNormal: 2, CostoNormal: 50, PesoUrgente: 1, CostoUrgente: 90},
				{Actividad: "D", Predecesora: "B", PesoNormal: 5, CostoNormal: 100, PesoUrgente: 1, CostoUrgente: 200},
				{Actividad: "E", Predecesora: "C", PesoNormal: 3, CostoNormal: 80, PesoUrgente: 1, CostoUrgente: 100},
				{Actividad: "E", Predecesora: "D", PesoNormal: 3, CostoNormal: 80, PesoUrgente: 1, CostoUrgente: 100},
				{Actividad: "F", Predecesora: "A", PesoNormal: 10, CostoNormal: 100, PesoUrgente: 5, CostoUrgente: 400},
			}}

		sol := ResuelveCompresion(ejemplo)

		testAbsoluteError(sol.CPMs[len(sol.CPMs)-1].DuracionTotal, 11, t)
	})

	t.Run("Dijkstra", func(t *testing.T) {
		ejemplo := Dijkstra{
			Grafo: []Edge{
				{Source: "O", Target: "A", Weight: 4},
				{Source: "O", Target: "B", Weight: 3},
				{Source: "O", Target: "C", Weight: 6},
				{Source: "A", Target: "D", Weight: 3},
				{Source: "A", Target: "C", Weight: 5},
				{Source: "B", Target: "C", Weight: 4},
				{Source: "B", Target: "E", Weight: 6},
				{Source: "C", Target: "D", Weight: 2},
				{Source: "C", Target: "F", Weight: 2},
				{Source: "C", Target: "E", Weight: 5},
				{Source: "D", Target: "G", Weight: 4},
				{Source: "D", Target: "F", Weight: 2},
				{Source: "E", Target: "F", Weight: 1},
				{Source: "F", Target: "G", Weight: 2},
				{Source: "F", Target: "H", Weight: 5},
				{Source: "E", Target: "H", Weight: 2},
				{Source: "E", Target: "I", Weight: 5},
				{Source: "I", Target: "H", Weight: 3},
				{Source: "G", Target: "H", Weight: 2},
				{Source: "G", Target: "T", Weight: 7},
				{Source: "H", Target: "T", Weight: 8},
				{Source: "I", Target: "T", Weight: 4},
			},
			Origen:  "O",
			Destino: "T",
		}

		sol := ResuelveDijkstra(ejemplo)

		testAbsoluteError(sol.Peso, 17.0, t)
		testAbsoluteError(float64(len(sol.Coords)), 10.0, t)
		testAbsoluteError(float64(len(sol.Bases)), 11.0, t)
	})

	t.Run("Kruskal", func(t *testing.T) {
		ejemplo := []Edge{
			{Source: "C", Target: "B", Weight: 4},
			{Source: "A", Target: "C", Weight: 3},
			{Source: "A", Target: "B", Weight: 6},
			{Source: "B", Target: "D", Weight: 2},
			{Source: "C", Target: "D", Weight: 3},
			{Source: "S", Target: "A", Weight: 7},
			{Source: "B", Target: "T", Weight: 5},
			{Source: "D", Target: "T", Weight: 2},
			{Source: "S", Target: "C", Weight: 8},
		}

		sol := ResuelveKruskal(ejemplo)

		testAbsoluteError(float64(len(sol.Tree)), 5.0, t)
		testAbsoluteError(sol.Weight, 17.0, t)
	})
}
