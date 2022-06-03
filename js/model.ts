interface ResponseFloydW {
  cambios: Array<Change>,
  iteraciones: Array<Array<Vertice>>,
  nodos: Array<string>,
}

interface MaxFlowSolution {
  flow: number,
  steps: Array<Path>,
}

interface ResponseCPM {
  actividades: Array<Actividad>,
  rutaCritica: Array<string>,
  duracionTotal: number,
}

interface coor {
  row: number,
  col: number,
}

interface ResponseDijkstra {
  bases: Array<string>,
  destino: string,
  origen: string,
  peso: number,
  tabla: Array<Array<string>>,
  coords: Array<coor>,
}

interface ResponsePERT {
  rutaCritica: Array<string>,
  estimaciones: Array<number>,
  varianzas: Array<number>,
  sumaVariazas: number,
  media: number,
  cpm: ResponseCPM,
}

interface Actividad {
  nombre: string,
  duracion: number,
  sucesores: Array<string>,
  proximoL: number,
  proximoR: number,
  lejanoL: number,
  lejanoR: number,
}

interface Path {
  graph: Array<Vertice>,
  path_used: string,
}

interface Vertice {
  source: string,
  target: string,
  weight: number,
}

interface VerticePERT {
  origen: string,
  destino: string,
  optimista: number,
  probable: number,
  pesimista: number,
}

interface Change {
  iteracion: number,
  origen: string,
  destino: string,
}

interface VerticeCompresion {
  actividad: string,
  predecesora: string,

  pesoNormal: number,
  costoNormal: number,

  pesoUrgente: number,
  costoUrgente: number,
}

interface CompresionData {
  tiempoObjetivo: number,
  actividades: Array<VerticeCompresion>,
}

interface ResponseCompresion {
  costoTiempo: Array<number>,
  iteraciones: Array<ResponseCPM>,
  actividadesComprimidas: Array<string>,
  costoActual: Array<number>,
}

interface Kruskal {
  tree_weight: number,
  dot_graph_frames: Array<string>,
}
