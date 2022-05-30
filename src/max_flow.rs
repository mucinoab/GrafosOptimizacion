use std::fmt::Write;

use indexmap::IndexSet;
use serde::{Deserialize, Serialize};

use crate::utils::{AdjList, Edge};

#[derive(Debug, Deserialize)]
pub struct MaxFlow {
    pub graph: Vec<Edge>,
    pub origin: String,
    pub target: String,
    pub directed: bool,
}

impl MaxFlow {
    pub fn new(graph: Vec<Edge>, origin: &str, target: &str, directed: bool) -> Self {
        Self {
            graph,
            origin: origin.into(),
            target: target.into(),
            directed,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct MaxFlowSolution {
    flow: f64,
    steps: Vec<Step>,
}

impl MaxFlowSolution {
    pub fn new() -> Self {
        Self {
            flow: 0.0,
            steps: Vec::new(),
        }
    }
}

#[derive(Debug, Serialize)]
struct Step {
    graph: Vec<Edge>,
    path_used: String, // TODO maybye vec of strings?
}

impl Step {
    fn new(graph: &mut Vec<Edge>, path_used: impl Into<String>) -> Self {
        Self {
            graph: graph.drain(..).collect(),
            path_used: path_used.into(),
        }
    }
}

pub(crate) fn solve(inp: MaxFlow) -> MaxFlowSolution {
    let mut solution = MaxFlowSolution::new();
    let mut edges = inp.graph.clone();

    if inp.directed {
        edges.extend(
            inp.graph
                .iter()
                .map(|e| Edge::new(&e.target, &e.source, e.weight)),
        );
    }

    solution.steps.push(Step::new(&mut edges, "Grafo Inicial"));

    let mut m = AdjList::new(&inp.graph, inp.directed);
    let m_og = m.clone();

    let mut marcados = IndexSet::new();

    solution.flow = trace_path(
        &mut solution,
        &mut marcados,
        &mut m,
        &inp.origin,
        &inp.target,
    );

    solution
}

fn trace_path<'e>(
    sol: &mut MaxFlowSolution,
    marcados: &mut IndexSet<(&'e str, &'e str)>,
    graph: &mut AdjList<'e>,
    current: &'e str,
    target: &'e str,
) -> f64 {
    let mut flujo = 0.0;

    if current != target {
        let vecinos = graph[current].clone();

        for (node, _) in vecinos {
            let v = (current, node);
            let p = graph[current][node];

            if p > 0.0 && !marcados.contains(&v) {
                marcados.insert(v);
                flujo += trace_path(sol, marcados, graph, node, target);
                marcados.remove(&v);
            }
        }

        return flujo;
    }

    let mut path = String::new();
    for (l, _) in marcados.iter() {
        write!(&mut path, "{l},").unwrap();
    }

    path.push_str(target);
    path.push_str("|c* = Mín{"); // TODO

    let cheapest_in_path = marcados
        .iter()
        .map(|(l, r)| graph[l][r])
        .min_by(|a, b| a.total_cmp(b))
        .unwrap();

    for (l, r) in marcados.iter() {
        let weight = graph[l].get_mut(r).unwrap();
        write!(&mut path, "{:.2},", weight).unwrap();
        *weight -= cheapest_in_path;
    }

    path.pop();
    write!(&mut path, "}} = {}", cheapest_in_path).unwrap();

    let mut algo = Vec::new();

    for (source, nes) in graph.inner.iter() {
        for (target, weight) in nes {
            algo.push(Edge::new(source, target, *weight));
        }
    }

    sol.steps.push(Step::new(&mut algo, path));

    cheapest_in_path
}

#[cfg(test)]
mod tests {
    use crate::{max_flow::MaxFlow, utils::Edge};

    use super::solve;

    #[test]
    fn solve_simple() {
        let input = MaxFlow::new(
            vec![
                Edge::new("bilbao", "s1", 4.0),
                Edge::new("bilbao", "s2", 1.0),
                Edge::new("barcelona", "s1", 2.0),
                Edge::new("barcelona", "s2", 3.0),
                Edge::new("sevilla", "s1", 2.0),
                Edge::new("sevilla", "s2", 2.0),
                Edge::new("sevilla", "s3", 3.0),
                Edge::new("valencia", "s2", 2.0),
                Edge::new("zaragoza", "s2", 3.0),
                Edge::new("zaragoza", "s3", 1.0),
                Edge::new("origen", "bilbao", 7.0),
                Edge::new("origen", "barcelona", 5.0),
                Edge::new("origen", "sevilla", 7.0),
                Edge::new("origen", "zaragoza", 6.0),
                Edge::new("origen", "valencia", 2.0),
                Edge::new("s1", "madrid", 8.0),
                Edge::new("s2", "madrid", 8.0),
                Edge::new("s3", "madrid", 8.0),
            ],
            "origen",
            "madrid",
            true,
        );

        let solution = solve(input);
        dbg!(&solution);
        assert_eq!(solution.flow, 20.0)
    }
}
