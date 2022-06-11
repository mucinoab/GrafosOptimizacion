use crate::utils::{AdjList, Edge};

use std::collections::HashSet;

#[derive(Debug, serde::Serialize)]
pub struct FloydWarshallSolution {
    changes: Vec<Change>,
    iterations: Vec<Vec<Edge>>,
    nodes: Vec<String>,
}

#[derive(Debug, serde::Serialize)]
pub struct Change {
    iteration: usize,
    source: String,
    target: String,
}

impl Change {
    pub fn new(s: &str, t: &str, iteration: usize) -> Self {
        Self {
            source: s.to_owned(),
            target: t.to_owned(),
            iteration,
        }
    }
}

pub fn solve(graph: Vec<Edge>) -> FloydWarshallSolution {
    let mut network = AdjList::new(&graph, true);
    let nodes: HashSet<_> = graph
        .iter()
        .flat_map(|Edge { source, target, .. }| [source, target])
        .map(|n| n.as_str())
        .collect();

    for source in &nodes {
        for target in &nodes {
            if source == target {
                // Distance to it self
                network.assign(source, target, 0.0);
                network.assign(target, source, 0.0);
            } else {
                // No connection means infinite cost
                if !network.exists_path(source, target) {
                    network.assign(source, target, f64::MAX);
                }

                if !network.exists_path(target, source) {
                    network.assign(target, source, f64::MAX);
                }
            }
        }
    }

    let mut aux;
    let mut iterations: Vec<Vec<Edge>> = Vec::new();
    let mut changes = Vec::new();
    network.directed = true;

    for (iter, bridge) in nodes.iter().enumerate() {
        iterations.push(network.as_ref().into());

        for source in &nodes {
            for target in &nodes {
                // TODO no directed graph
                aux = network[source][bridge] + network[bridge][target];
                // TODO I think the chanes are reported incorrectly

                if network[source][target] > aux {
                    changes.push(Change::new(source, target, iter));
                    network.assign(source, target, aux);
                }
            }
        }
    }

    iterations.push(network.as_ref().into());

    let mut nodes: Vec<String> = nodes.iter().map(|&n| n.to_owned()).collect();
    nodes.sort_unstable();

    FloydWarshallSolution {
        changes,
        iterations,
        nodes,
    }
}

#[cfg(test)]
mod tests {
    use super::solve;
    use crate::utils::{AdjList, Edge};
    use std::collections::HashMap;

    #[test]
    fn solve_1() {
        let correct_sol: HashMap<&str, HashMap<&str, f64>> = [
            (
                "1",
                [
                    ("1", 0.0),
                    ("2", 700.0),
                    ("3", 200.0),
                    ("4", 900.0),
                    ("5", 800.0),
                    ("6", 1000.0),
                ],
            ),
            (
                "2",
                [
                    ("1", 1.797_693_134_862_315_7e308),
                    ("2", 0.0),
                    ("3", 300.0),
                    ("4", 200.0),
                    ("5", 500.0),
                    ("6", 300.0),
                ],
            ),
            (
                "3",
                [
                    ("1", 1.797_693_134_862_315_7e308),
                    ("2", 1.797_693_134_862_315_7e308),
                    ("3", 0.0),
                    ("4", 700.0),
                    ("5", 600.0),
                    ("6", 800.0),
                ],
            ),
            (
                "4",
                [
                    ("1", 1.797_693_134_862_315_7e308),
                    ("2", 1.797_693_134_862_315_7e308),
                    ("3", 1.797_693_134_862_315_7e308),
                    ("4", 0.0),
                    ("5", 300.0),
                    ("6", 100.0),
                ],
            ),
            (
                "5",
                [
                    ("1", 1.797_693_134_862_315_7e308),
                    ("2", 1.797_693_134_862_315_7e308),
                    ("3", 1.797_693_134_862_315_7e308),
                    ("4", 1.797_693_134_862_315_7e308),
                    ("5", 0.0),
                    ("6", 1.797_693_134_862_315_7e308),
                ],
            ),
            (
                "6",
                [
                    ("1", 1.797_693_134_862_315_7e308),
                    ("2", 1.797_693_134_862_315_7e308),
                    ("3", 1.797_693_134_862_315_7e308),
                    ("4", 1.797_693_134_862_315_7e308),
                    ("5", 500.0),
                    ("6", 0.0),
                ],
            ),
        ]
        .iter()
        .map(|&(k, v)| (k, v.into()))
        .collect();

        let input = vec![
            Edge::new("1", "2", 700.0),
            Edge::new("1", "3", 200.0),
            Edge::new("2", "3", 300.0),
            Edge::new("2", "4", 200.0),
            Edge::new("2", "6", 400.0),
            Edge::new("3", "4", 700.0),
            Edge::new("3", "5", 600.0),
            Edge::new("4", "5", 300.0),
            Edge::new("4", "6", 100.0),
            Edge::new("6", "5", 500.0),
        ];
        let sol = solve(input);
        let sol = AdjList::new(sol.iterations.last().unwrap(), true);

        assert_eq!(sol.inner, correct_sol);
    }

    #[test]
    fn solve_2() {
        let correct_sol: HashMap<&str, HashMap<&str, f64>> = [
            ("1", [("1", 0.0), ("2", 3.0), ("3", 7.0), ("4", 5.0)]),
            ("2", [("1", 2.0), ("2", 0.0), ("3", 6.0), ("4", 4.0)]),
            ("3", [("1", 3.0), ("2", 1.0), ("3", 0.0), ("4", 5.0)]),
            ("4", [("1", 5.0), ("2", 3.0), ("3", 2.0), ("4", 0.0)]),
        ]
        .iter()
        .map(|&(k, v)| (k, v.into()))
        .collect();

        let input = vec![
            Edge::new("1", "2", 3.0),
            Edge::new("1", "4", 5.0),
            Edge::new("2", "1", 2.0),
            Edge::new("2", "4", 4.0),
            Edge::new("3", "2", 1.0),
            Edge::new("4", "3", 2.0),
        ];
        let sol = solve(input);
        let sol = AdjList::new(sol.iterations.last().unwrap(), true);

        assert_eq!(sol.inner, correct_sol);
    }
}
