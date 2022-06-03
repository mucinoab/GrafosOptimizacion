use crate::utils::{AdjList, Edge};

use std::fmt::Write;

use indexmap::IndexSet;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct MaxFlow {
    pub graph: Vec<Edge>,
    pub origin: String,
    pub target: String,
    pub directed: bool,
}

impl MaxFlow {
    #[cfg(test)]
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

    fn add_step<'e>(&mut self, network: &AdjList<'e>, path: impl Into<String>) {
        let mut updated_network = Vec::new();

        for (source, neighbours) in network.inner.iter() {
            for (target, weight) in neighbours {
                updated_network.push(Edge::new(source, target, *weight));
            }
        }

        self.steps.push(Step::new(updated_network, path));
    }
}

#[derive(Debug, Serialize)]
struct Step {
    graph: Vec<Edge>,
    path_used: String, // TODO maybye vec of strings?
}

impl Step {
    fn new(graph: Vec<Edge>, path_used: impl Into<String>) -> Self {
        Self {
            graph,
            path_used: path_used.into(),
        }
    }
}

pub(crate) fn solve(
    MaxFlow {
        graph,
        origin,
        target,
        directed,
    }: MaxFlow,
) -> MaxFlowSolution {
    let mut edges = graph.clone();

    if !directed {
        edges.extend(
            graph
                .iter()
                .map(|e| Edge::new(&e.target, &e.source, e.weight)),
        );
    }

    let mut solution = MaxFlowSolution::new();
    solution.steps.push(Step::new(edges, "Grafo Inicial"));

    let mut network = AdjList::new(&graph, directed);
    let mut original_network = network.clone();

    let mut visited = IndexSet::new();
    solution.flow =
        trace_cheapest_path(&mut solution, &mut visited, &mut network, &origin, &target);

    // Update network weights with max flow
    original_network.inner.iter_mut().for_each(|(_, n)| {
        n.iter_mut().for_each(|(_, w)| {
            *w -= solution.flow;
            //assert!(*w >= 0.0)
        })
    });

    solution.add_step(&original_network, "Patrón de Flujo");

    solution
}

fn trace_cheapest_path<'e>(
    solution: &mut MaxFlowSolution,
    visited: &mut IndexSet<(&'e str, &'e str)>,
    graph: &mut AdjList<'e>,
    current: &'e str,
    target: &'e str,
) -> f64 {
    let mut flow = 0.0;

    if current != target {
        let vecinos = graph[current].clone();

        for (node, _) in vecinos {
            let path = (current, node);
            let path_weight = graph[current][node];

            if path_weight > 0.0 && !visited.contains(&path) {
                visited.insert(path);
                flow += trace_cheapest_path(solution, visited, graph, node, target);
                visited.remove(&path);
                //dbg!(current, target, flow);
            }
        }

        return flow;
    }

    // If we are on the target node, we trace the path used to reach this node.
    let mut path = String::new();

    // The nodes that make up the route.
    for (node, _) in visited.iter() {
        write!(&mut path, "{node},").unwrap();
    }

    path.push_str(target);
    path.push_str("|c* = Mín{"); // TODO put this in a const variable

    let cheapest_in_path = visited
        .iter()
        .map(|(l, r)| graph[l][r])
        .min_by(|a, b| a.total_cmp(b))
        .unwrap();

    // Record and update the weights in the route.
    for (l_node, r_node) in visited.iter() {
        let weight = graph[l_node].get_mut(r_node).unwrap();
        write!(&mut path, "{:.2},", weight).unwrap();
        *weight -= cheapest_in_path; // Update weights
    }

    path.pop();
    write!(&mut path, "}} = {}", cheapest_in_path).unwrap();
    solution.add_step(graph, path);

    cheapest_in_path
}

#[cfg(test)]
mod tests {
    use super::solve;
    use crate::{max_flow::MaxFlow, utils::Edge};

    #[test]
    fn solve_1() {
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

        // Note, given the random nature of the algorithm, the number of steps is
        // non-deterministic, so we can't test that.
        assert_eq!((solve(input)).flow, 20.0);
    }

    #[test]
    fn solve_2() {
        let input = MaxFlow::new(
            vec![
                Edge::new("0", "1", 16.0),
                Edge::new("0", "2", 13.0),
                Edge::new("1", "2", 10.0),
                Edge::new("1", "3", 12.0),
                Edge::new("2", "1", 4.0),
                Edge::new("2", "4", 14.0),
                Edge::new("3", "2", 9.0),
                Edge::new("3", "5", 20.0),
                Edge::new("4", "3", 7.0),
                Edge::new("4", "5", 4.0),
            ],
            "0",
            "5",
            true,
        );

        assert_eq!((solve(input)).flow, 23.0);
    }

    #[test]
    fn solve_3() {
        let input = MaxFlow::new(
            vec![
                Edge::new("s", "a", 8.0),
                Edge::new("s", "d", 3.0),
                Edge::new("a", "b", 9.0),
                Edge::new("d", "b", 7.0),
                Edge::new("d", "c", 4.0),
                Edge::new("b", "t", 2.0),
                Edge::new("c", "t", 5.0),
            ],
            "s",
            "t",
            false,
        );

        assert_eq!(solve(input).flow, 6.0);
    }
}
