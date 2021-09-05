package main

type VerticePert struct {
	Actividad   string  `json:"origen"`
	Predecesora string  `json:"destino"`
	Optimista   float64 `json:"optimista"`
	Probable    float64 `json:"probable"`
	Pesimista   float64 `json:"pesimista"`
}

type RespuesaPERT struct {
	RutaCritica  []string     `json:"rutaCritica"`
	Estimaciones []float64    `json:"estimaciones"`
	Varianzas    []float64    `json:"varianzas"`
	SumaVariazas float64      `json:"sumaVariazas"`
	Media        float64      `json:"media"`
	CPM          RespuestaCPM `json:"cpm"`
}

func ResuelvePERT(a []VerticePert) RespuesaPERT {
	actividades := estimaDuraciones(a)
	mActividades := mapActividades(a)

	varianzas := make([]float64, len(actividades))
	estimaciones := make([]float64, len(actividades))

	for idx, actividad := range actividades {
		estimaciones[idx] = actividad.Peso
		varianzas[idx] = varianza(a[idx])
	}

	respuesta := ResuelveCPM(actividades)

	sumaVarianza := 0.0

	for _, actividad := range respuesta.RutaCritica {
		sumaVarianza += varianza(mActividades[actividad])
	}

	return RespuesaPERT{
		respuesta.RutaCritica,
		estimaciones,
		varianzas,
		sumaVarianza,
		respuesta.DuracionTotal,
		respuesta,
	}
}

func duracionEstimada(v *VerticePert) float64 {
	return (v.Optimista + 4*v.Probable + v.Pesimista) / 6
}

func varianza(v VerticePert) float64 {
	return (v.Pesimista - v.Optimista) * (v.Pesimista - v.Optimista) / 36
}

func estimaDuraciones(v []VerticePert) []Vertice {
	actividades := make([]Vertice, len(v))

	for idx, a := range v {
		actividades[idx] = Vertice{a.Actividad, a.Predecesora, duracionEstimada(&a)}
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
