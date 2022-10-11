interface FloydWarshallSolution {
  changes: Array<Change>,
  iterations: Array<Array<Vertice>>,
  nodes: Array<string>,
}

interface MaxFlowSolution {
  flow: number,
  steps: Array<Path>,
}

interface CriticalPathSolution {
  activities: Array<Activity>,
  critical_path: Array<string>,
  total_duration: number,
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
  estimates: Array<number>,
  variances: Array<number>,
  sum_of_variances: number,
  mean: number,
  cpm: CriticalPathSolution,
}

interface Activity {
  name: string,
  duration: number,
  succesors: Array<string>,
  closest_lhs: number,
  closest_rhs: number,
  farthest_lhs: number,
  farthest_rhs: number,
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
  source: string,
  target: string,
  weight: number,
  optimistic_weight: number,
  pessimistic_weight: number,
}

interface Change {
  iteration: number,
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
  iteraciones: Array<CriticalPathSolution>,
  actividadesComprimidas: Array<string>,
  costoActual: Array<number>,
}

interface Kruskal {
  tree_weight: number,
  dot_graph_frames: Array<string>,
}
