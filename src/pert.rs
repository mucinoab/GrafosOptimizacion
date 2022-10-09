//! Program Evaluation and Review Technique, PERT
use crate::{
    critical_path::{self, CriticalPathSolution},
    utils::Edge,
};

use std::{collections::HashMap, ops::Deref};

use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct PertSolution {
    estimates: Vec<f64>,
    variances: Vec<f64>,
    sum_of_variances: f64,
    mean: f64,
    cpm: CriticalPathSolution,
}

#[tracing::instrument]
pub fn solve(graph: Vec<Edge>) -> PertSolution {
    // Calculate the estimated duration for each edge.
    let activities: Vec<Edge> = graph
        .iter()
        .map(|n| Edge::new(&n.source, &n.target, estimated_duration(n)))
        .collect();

    let variances = graph.iter().map(variance).collect();
    let estimates = activities.iter().map(|e| e.weight).collect();

    let m_actividades: HashMap<&str, &Edge> =
        graph.iter().map(|e| (e.source.as_str(), e)).collect();

    let cpm = critical_path::solve(activities);
    let sum_of_variances = cpm
        .critical_path
        .iter()
        .filter_map(|n| m_actividades.get(n.as_str()))
        .map(Deref::deref)
        .map(variance) // TODO: Avoid calling variance twice, we already hace in variances.
        .sum();

    PertSolution {
        estimates,
        variances,
        sum_of_variances,
        mean: cpm.total_duration,
        cpm,
    }
}

pub fn estimated_duration(node: &Edge) -> f64 {
    let probable = node.weight;
    let optimistic = node.optimistic_weight.unwrap();
    let pessimistic = node.pessimistic_weight.unwrap();

    (optimistic + 4.0 * probable + pessimistic) / 6.0
}

pub fn variance(node: &Edge) -> f64 {
    let optimistic = node.optimistic_weight.unwrap();
    let pessimistic = node.pessimistic_weight.unwrap();

    (pessimistic - optimistic) * (pessimistic - optimistic) / 36.0
}

#[cfg(test)]
mod tests {
    use super::solve;
    use crate::utils::Edge;

    #[test]
    fn solve_1() {
        let grafo = vec![
            Edge::new_pert("A", "-", 1.0, 2.0, 3.0),
            Edge::new_pert("B", "A", 2.0, 4.0, 6.0),
            Edge::new_pert("C", "B", 0.0, 1.0, 2.0),
            Edge::new_pert("C", "H", 0.0, 1.0, 2.0),
            Edge::new_pert("D", "-", 3.0, 6.0, 9.0),
            Edge::new_pert("E", "G", 2.0, 3.0, 4.0),
            Edge::new_pert("F", "E", 3.0, 5.0, 7.0),
            Edge::new_pert("G", "D", 1.0, 2.0, 3.0),
            Edge::new_pert("H", "G", 1.0, 2.0, 3.0),
            Edge::new_pert("I", "D", 1.0, 3.0, 5.0),
            Edge::new_pert("J", "I", 3.0, 4.0, 5.0),
            Edge::new_pert("K", "D", 2.0, 3.0, 4.0),
            Edge::new_pert("L", "J", 3.0, 5.0, 7.0),
            Edge::new_pert("L", "K", 3.0, 5.0, 7.0),
            Edge::new_pert("M", "C", 1.0, 2.0, 3.0),
            Edge::new_pert("M", "L", 1.0, 2.0, 3.0),
        ];

        let mut sol = solve(grafo);
        sol.cpm.critical_path.sort();

        assert_eq!(sol.sum_of_variances, 19.0 / 9.0);
        assert_eq!(sol.mean, 20.0);
        assert_eq!(
            sol.cpm.critical_path,
            vec!["-", "D", "Fin", "I", "J", "L", "M"]
        );
    }

    #[test]
    fn solve_2() {
        let grafo = vec![
            Edge::new_pert("A", "-", 12.0, 15.0, 18.0),
            Edge::new_pert("B", "-", 6.0, 9.0, 12.0),
            Edge::new_pert("C", "A", 9.0, 12.0, 15.0),
            Edge::new_pert("D", "B", 6.0, 9.0, 18.0),
            Edge::new_pert("E", "B", 18.0, 30.0, 36.0),
            Edge::new_pert("F", "A", 9.0, 12.0, 15.0),
            Edge::new_pert("G", "C", 36.0, 36.0, 42.0),
            Edge::new_pert("H", "D", 42.0, 48.0, 54.0),
            Edge::new_pert("I", "A", 6.0, 12.0, 18.0),
            Edge::new_pert("J", "H", 3.0, 6.0, 9.0),
            Edge::new_pert("J", "G", 3.0, 6.0, 9.0),
            Edge::new_pert("J", "E", 3.0, 6.0, 9.0),
            Edge::new_pert("K", "F", 3.0, 6.0, 9.0),
            Edge::new_pert("K", "J", 3.0, 6.0, 9.0),
            Edge::new_pert("K", "I", 3.0, 6.0, 9.0),
        ];

        let mut sol = solve(grafo);
        sol.cpm.critical_path.sort();

        assert_eq!(sol.mean, 79.0);
        assert_eq!(sol.sum_of_variances, 11.0);

        assert_eq!(
            sol.cpm.critical_path,
            vec!["-", "B", "D", "Fin", "H", "J", "K"]
        );
    }
}
