package methods

import (
	"math"
)

// TODO nombre
type CompresionData struct {
	TiempoObjetivo float64             `json:"tiempoObjetivo"`
	Actividades    []VerticeCompresion `json:"actividades"`
}

type VerticeCompresion struct {
	Actividad   string `json:"actividad"`
	Predecesora string `json:"predecesora"`

	PesoNormal  float64 `json:"pesoNormal"`
	CostoNormal float64 `json:"costoNormal"`

	PesoUrgente  float64 `json:"pesoUrgente"`
	CostoUrgente float64 `json:"costoUrgente"`
}

type RespuesaCompresion struct {
	CostoTiempo            []float64      `json:"costoTiempo"`
	CPMs                   []RespuestaCPM `json:"iteraciones"`
	ActividadesComprimidas []string       `json:"actividadesComprimidas"`
	CostoActual            []float64      `json:"costoActual"`
}

type Costos struct {
	PesoNormal   float64
	CostoNormal  float64
	PesoUrgente  float64
	CostoUrgente float64
	CostoTiempo  float64
}

func ResuelveCompresion(c CompresionData) RespuesaCompresion {
	iteracionesCPM := make([]RespuestaCPM, 0, len(c.Actividades))
	aComprimidas := make([]string, 0, len(c.Actividades))
	costoActual := make([]float64, 0, len(c.Actividades))
	costos := mapCostos(c.Actividades)

	actividadesComprimidas := Set()
	actividadesComprimidas.Add("-") // Inicio
	actividadesComprimidas.Add("Fin")

	actividades := transformVertex(c.Actividades)
	actividadesCpy := Clone(actividades)

	resultadoCpm := ResuelveCPM(actividades)
	iteracionesCPM = append(iteracionesCPM, resultadoCpm)
	costoActual = append(costoActual, calculaCostoRuta(costos, actividadesCpy, actividadesComprimidas))

	for {
		actMin := Inf
		var actMinOrigen string

		for _, a := range resultadoCpm.RutaCritica {
			if !actividadesComprimidas.Contains(a) {
				if costos[a].CostoTiempo < actMin {
					actMin = costos[a].CostoTiempo
					actMinOrigen = a
				}
			}
		}

		actividades = Clone(actividadesCpy)

		for idx, a := range actividades {
			if a.Source == actMinOrigen {
				// Cambiar peso normal por peso de compresión
				actividades[idx].Weight = costos[actMinOrigen].PesoUrgente
				actividadesComprimidas.Add(actMinOrigen)
			}
		}

		if actMin == Inf || c.TiempoObjetivo >= iteracionesCPM[len(iteracionesCPM)-1].DuracionTotal {
			// No hubo cambio o se llegó al tiempo objetivo
			break
		}

		// Agrega actividad comprimida TODO
		aComprimidas = append(aComprimidas, actMinOrigen)

		actividadesCpy = Clone(actividades)
		resultadoCpm = ResuelveCPM(actividades)
		iteracionesCPM = append(iteracionesCPM, resultadoCpm)

		costoActual = append(costoActual, calculaCostoRuta(costos, actividadesCpy, actividadesComprimidas))
	}

	costoTiempo := make([]float64, len(c.Actividades))

	for idx, a := range c.Actividades[:] {
		costoTiempo[idx] = costos[a.Actividad].CostoTiempo
	}

	for idx, a := range costoTiempo {
		// TODO ver función CalculaCostoTiempo
		if math.IsNaN(a) {
			costoTiempo[idx] = 0.0
		} else if math.IsInf(a, 1) {
			costoTiempo[idx] = jsMaxValue
		} else if math.IsInf(a, -1) {
			costoTiempo[idx] = -jsMaxValue
		}
	}

	return RespuesaCompresion{costoTiempo, iteracionesCPM, aComprimidas, costoActual}
}

func CalculaCostoTiempo(a *VerticeCompresion) float64 {
	// TODO casos en los que la división de valores excepcionales (+-Inf, Nan)
	return (a.CostoUrgente - a.CostoNormal) / (a.PesoNormal - a.PesoUrgente)
}

func mapCostos(actividades []VerticeCompresion) map[string]Costos {
	// Mapea tiempo de compresión y calculo de costo tiempo
	costos := make(map[string]Costos, len(actividades))

	for _, a := range actividades[:] {
		costos[a.Actividad] = Costos{
			a.PesoNormal,
			a.CostoNormal,

			a.PesoUrgente,
			a.CostoUrgente,

			CalculaCostoTiempo(&a),
		}
	}

	return costos
}

// Transforma un vértice de compresión a un vértice regular
func transformVertex(v []VerticeCompresion) []Edge {
	actividades := make([]Edge, len(v))

	for idx, a := range v {
		actividades[idx] = Edge{a.Actividad, a.Predecesora, a.PesoNormal}
	}

	return actividades
}

func Clone(arre []Edge) []Edge {
	cpy := make([]Edge, len(arre))
	copy(cpy, arre)

	return cpy
}

func calculaCostoRuta(c map[string]Costos, act []Edge, comprimidos set) float64 {
	vistos := Set()
	costo := 0.0

	for _, a := range act[:] {
		// We use a set to avoid adding the same cost more than once
		if !vistos.Contains(a.Source) {
			if comprimidos.Contains(a.Source) {
				costo += c[a.Source].CostoUrgente
			} else {
				costo += c[a.Source].CostoNormal
			}
			vistos.Add(a.Source)
		}
	}

	return costo
}
