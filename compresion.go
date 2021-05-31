package main

// TODO nombre
type CompresionData struct {
	TiempoObjetivo float64             `json:"tiempoObjetivo"`
	Actividades    []VerticeCompresion `json:"actividades"`
}

type VerticeCompresion struct {
	Actividad   string `json:"actividades"`
	Predecesora string `json:"predecesora"`

	PesoNormal  float64 `json:"pesoNormal"`
	CostoNormal float64 `json:"costoNormal"`

	PesoUrgente  float64 `json:"pesoUrgente"`
	CostoUrgente float64 `json:"costoUrgente"`
}

type RespuesaCompresion struct {
	CostoTiempo []float64      `json:"costoTiempo"`
	CPMs        []RespuestaCPM `json:"iteraciones"`
}

func ResuelveCompresion(c CompresionData) RespuesaCompresion {
	iteracionesCPM := make([]RespuestaCPM, 0, len(c.Actividades))
	precioCosto, costoUrgente := mapCostos(c.Actividades)

	actividadesComprimidas := set()
	actividadesComprimidas.Add("-") // Inicio
	actividadesComprimidas.Add("Fin")

	actividades := transformVertex(c.Actividades)
	actividades_cpy := Clone(actividades)

	resultadoCpm := ResuelveCPM(actividades)
	iteracionesCPM = append(iteracionesCPM, resultadoCpm)

	for {
		actMin := Inf
		var actMinOrigen string

		for _, a := range resultadoCpm.RutaCritica {
			if !actividadesComprimidas.Contains(a) {
				if precioCosto[a] < actMin {
					actMin = precioCosto[a]
					actMinOrigen = a
				}
			}
		}

		actividades = Clone(actividades_cpy)

		for idx, a := range actividades {
			if a.Origen == actMinOrigen {
				// Cambiar peso normal por peso de compresión
				actividades[idx].Peso = costoUrgente[actMinOrigen]
				actividadesComprimidas.Add(actMinOrigen)
			}
		}

		if actMin == Inf || c.TiempoObjetivo >= iteracionesCPM[len(iteracionesCPM)-1].DuracionTotal {
			// No hubo cambio o se llegó al tiempo objetivo
			break
		}

		actividades_cpy = Clone(actividades)
		resultadoCpm = ResuelveCPM(actividades)
		iteracionesCPM = append(iteracionesCPM, resultadoCpm)
	}

	costoTiempo := make([]float64, len(c.Actividades))

	for idx, a := range c.Actividades {
		// TODO calculamos esto dos veces
		costoTiempo[idx] = CalculaCostoTiempo(&a)
	}

	return RespuesaCompresion{costoTiempo, iteracionesCPM}
}

func CalculaCostoTiempo(a *VerticeCompresion) float64 {
	return (a.CostoUrgente - a.CostoNormal) / (a.PesoNormal - a.PesoUrgente)
}

func mapCostos(actividades []VerticeCompresion) (map[string]float64, map[string]float64) {
	// Mapea tiempo de compresión y calculo de costo tiempo
	ct := make(map[string]float64, len(actividades))
	m := make(map[string]float64, len(actividades))

	for _, a := range actividades {
		ct[a.Actividad] = CalculaCostoTiempo(&a)
		m[a.Actividad] = a.PesoUrgente
	}

	return ct, m
}

// Transforma un vértice de compresión a un vértice regular
func transformVertex(v []VerticeCompresion) []Vertice {
	actividades := make([]Vertice, len(v))

	for idx, a := range v {
		actividades[idx] = Vertice{a.Actividad, a.Predecesora, a.PesoNormal}
	}

	return actividades
}

func Clone(arre []Vertice) []Vertice {
	cpy := make([]Vertice, len(arre))
	copy(cpy, arre)

	return cpy
}
