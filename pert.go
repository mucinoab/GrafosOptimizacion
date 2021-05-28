package main

import (
	"encoding/json"
	"log"
	"math"
)

type VerticePert struct {
	Actividad   string  `json:"origen"`
	Predecesora string  `json:"destino"`
	Optimista   float64 `json:"optimista"`
	Probable    float64 `json:"probable"`
	Pesimista   float64 `json:"pesimista"`
}

type RespuesaPERT struct {
	RutaCritica  []string  `json:"rutaCritica"`
	Estimaciones []float64 `json:"estimaciones"`
	Varianzas    []float64 `json:"varianzas"`
	SumaVariazas float64   `json:"sumaVariazas"`
	Media        float64   `json:"media"`
}

func ResuelvePERT(a []VerticePert) ([]byte, RespuesaPERT) {
	actividades := estimaDuraciones(a)
	mActividades := mapActividades(a)

	varianzas := make([]float64, len(actividades))
	estimaciones := make([]float64, len(actividades))

	for idx, actividad := range actividades {
		estimaciones[idx] = actividad.Peso
		varianzas[idx] = varianza(mActividades[actividad.Destino])
	}

	_, respuesta := ResuelveCPM(actividades)

	sumaVarianza := 0.0

	for _, actividad := range respuesta.RutaCritica {
		sumaVarianza += varianza(mActividades[actividad])
	}

	r := RespuesaPERT{respuesta.RutaCritica, estimaciones, varianzas, sumaVarianza, respuesta.DuracionTotal}

	resp, err := json.Marshal(r)

	if err != nil {
		log.Println(err)
		return nil, r
	} else {
		return resp, r
	}
}

func duracionEstimada(v *VerticePert) float64 {
	return (v.Optimista + 4*v.Probable + v.Pesimista) / 6
}

func varianza(v VerticePert) float64 {
	return math.Pow(v.Pesimista-v.Optimista, 2) / 36
}

func estimaDuraciones(v []VerticePert) []Vertice {
	actividades := make([]Vertice, 0, len(v))

	for _, a := range v {
		nuevaActividad := Vertice{a.Actividad, a.Predecesora, duracionEstimada(&a)}
		actividades = append(actividades, nuevaActividad)
	}

	return actividades
}

func mapActividades(acts []VerticePert) map[string]VerticePert {
	actividades := make(map[string]VerticePert, len(acts))

	for _, a := range acts {
		actividades[a.Actividad] = a
	}

	return actividades
}
