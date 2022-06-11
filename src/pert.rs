use crate::{
    critical_path::{self, CriticalPathSolution},
    utils::Edge,
};

use std::collections::HashMap;

use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct PertSolution {
    critical_path: Vec<String>,
    estimates: Vec<f64>,
    variances: Vec<f64>,
    sum_of_variances: f64,
    mean: f64,
    cpm: CriticalPathSolution,
}

pub fn solve(graph: Vec<Edge>) -> PertSolution {
    let activities: Vec<Edge> = graph
        .iter()
        .map(|n| {
            let mut m = n.clone();
            m.weight = estimated_duration(&n);
            //std::mem::swap(&mut m.source, &mut m.target);

            m
        })
        .collect();
    let m_actividades: HashMap<_, _> = graph
        .iter()
        .map(|n| (n.target.as_str(), n.clone()))
        .collect();
    let variances = activities.iter().map(variance).collect();
    let estimates = activities.iter().map(|n| n.weight).collect();
    eprintln!("{:?}", &activities);
    let cpm = critical_path::solve(activities);
    eprintln!("{:?}", &cpm.critical_path);
    dbg!(&cpm.total_duration);

    let sum_of_variances = cpm
        .critical_path
        .iter()
        .filter_map(|n| m_actividades.get(n.as_str()))
        .map(variance)
        .sum();

    PertSolution {
        estimates,
        variances,
        sum_of_variances,
        critical_path: cpm.critical_path.clone(),
        mean: cpm.total_duration,
        cpm,
    }
}

pub fn estimated_duration(node: &Edge) -> f64 {
    // We are sure this is safe because these are only used in this method
    let optimistic = node.optimistic_weight.unwrap();
    let pessimistic = node.pessimistic_weight.unwrap();

    eprintln!(
        "{} {} {} {}",
        optimistic,
        node.weight,
        pessimistic,
        (optimistic + 4.0 * node.weight + pessimistic) / 6.0
    );

    (optimistic + 4.0 * node.weight + pessimistic) / 6.0
}

pub fn variance(node: &Edge) -> f64 {
    // We are sure this is safe because these are only used in this method
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

        let sol = solve(grafo);

        assert_eq!(sol.sum_of_variances, 19.0 / 9.0);
        assert_eq!(sol.mean, 20.0);
    }
}
