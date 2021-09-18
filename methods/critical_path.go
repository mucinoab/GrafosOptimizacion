package methods

import "math"

type Actividad struct {
	Nombre    string   `json:"nombre"`
	Duracion  float64  `json:"duracion"`
	Sucesores []string `json:"sucesores"`

	// Tiempo más próximo, izquierda | derecha
	ProximoL float64 `json:"proximoL"`
	ProximoR float64 `json:"proximoR"`

	// Tiempo más lejano, izquierda | derecha
	LejanoL float64 `json:"lejanoL"`
	LejanoR float64 `json:"lejanoR"`
}

func NuevaActividad(n string, p float64) *Actividad {
	return &Actividad{n, p, []string{}, NInf, NInf, Inf, Inf}
}

type RespuestaCPM struct {
	Actividades   []*Actividad `json:"actividades"`
	RutaCritica   []string     `json:"rutaCritica"`
	DuracionTotal float64      `json:"duracionTotal"`
}

func ResuelveCPM(p []Edge) RespuestaCPM {
	anterior := VerticesToAdjList(&p, true)

	actividades := make(map[string]*Actividad, len(p))
	actividades["-"] = &Actividad{"-", 0, []string{}, 0, 0, 0, 0} // Inicio

	s := Set()
	sn := Set()

	for idx := 0; idx < len(p); idx += 1 {
		actividades[p[idx].Source] = NuevaActividad(p[idx].Source, p[idx].Weight)

		s.Add(p[idx].Source)
		// Invertimos porque el formato de la tabla es distinto
		p[idx].Source, p[idx].Target = p[idx].Target, p[idx].Source
		s.Add(p[idx].Source)
		sn.Add(p[idx].Source)
	}

	siguientes := VerticesToAdjList(&p, true)
	recorridoIda("-", siguientes, actividades)

	duracionTotal := NInf
	aTerminales := s.SymmetricDifference(sn).m

	for k := range aTerminales {
		duracionTotal = math.Max(duracionTotal, actividades[k].ProximoR)
	}

	// Actividades terminales
	for t := range aTerminales {
		actividades[t].LejanoR = duracionTotal
		actividades[t].LejanoL = duracionTotal - actividades[t].Duracion
		recorridoRegreso(t, anterior, actividades)
	}

	// Ruta crítica
	ruta := make([]string, 0, len(actividades))
	acti := make([]*Actividad, 0, len(actividades))
	idx := 0

	for a, v := range actividades {
		acti = append(acti, v)

		// Holgura de ~cero
		if math.Abs(v.ProximoR-v.LejanoR) < Epsilon {
			ruta = append(ruta, a)
		}

		// Los todos los sucesores de cada actividad
		if len(siguientes[a]) == 0 {
			acti[idx].Sucesores = append(acti[idx].Sucesores, "Fin")
		} else {
			for s := range siguientes[a] {
				acti[idx].Sucesores = append(acti[idx].Sucesores, s)
			}
		}
		idx += 1
	}

	// Nodo final
	acti = append(acti, NuevaActividad("Fin", duracionTotal))
	ruta = append(ruta, "Fin")

	return RespuestaCPM{acti, ruta, duracionTotal}
}

func recorridoIda(anterior string, s map[string]map[string]float64, n map[string]*Actividad) {
	duracion := n[anterior].ProximoR

	for ve := range s[anterior] {
		if n[ve].ProximoL < duracion {
			n[ve].ProximoL = duracion
			n[ve].ProximoR = n[ve].Duracion + duracion
			recorridoIda(ve, s, n)
		}
	}
}

func recorridoRegreso(anterior string, s map[string]map[string]float64, n map[string]*Actividad) {
	duracion := n[anterior].LejanoL

	for ve := range s[anterior] {
		if n[ve].LejanoR > duracion {
			n[ve].LejanoR = duracion
			n[ve].LejanoL = duracion - n[ve].Duracion
			recorridoRegreso(ve, s, n)
		}
	}
}
