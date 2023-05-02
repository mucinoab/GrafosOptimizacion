//! Compression, project acceleration
use crate::{
    critical_path::{self, Solution as CriticalPathSolution},
    utils,
};

use std::collections::{HashMap, HashSet};

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct Compression {
    target_time: f64,
    activities: Vec<Edge>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Edge {
    target: String,
    source: String,

    normal_weight: f64,
    normal_cost: f64,

    urgent_weight: f64,
    urgent_cost: f64,

    time_cost: Option<f64>,
}

impl Edge {
    #[cfg(test)]
    fn new(
        target: impl Into<String>,
        source: impl Into<String>,
        normal_weight: f64,
        normal_cost: f64,
        urgent_weight: f64,
        urgent_cost: f64,
    ) -> Self {
        Self {
            target: target.into(),
            source: source.into(),
            normal_weight,
            normal_cost,
            urgent_weight,
            urgent_cost,
            time_cost: None,
        }
    }

    fn compute_time_cost(&mut self) {
        if self.time_cost.is_none() {
            self.time_cost = Some(
                // TODO handle division and subtraction edge cases
                (self.urgent_cost - self.normal_cost) / (self.normal_weight - self.urgent_weight),
            );
        }
    }
}

#[derive(Debug, Serialize)]
pub struct Solution {
    time_cost: Vec<f64>,
    iterations: Vec<CriticalPathSolution>,
    compressed_activities: Vec<String>,
    actual_cost: Vec<f64>,
}

#[tracing::instrument]
pub fn solve(mut c: Compression) -> Solution {
    // Compute the time-cost for all the nodes.
    c.activities.iter_mut().for_each(Edge::compute_time_cost);

    // A quick "cache" to quickly access all the costs for any given node.
    let costs: HashMap<&str, &Edge> = c
        .activities
        .iter()
        .map(|a| (a.target.as_str(), a))
        .collect();

    // All the activities that have been compressed.
    let mut compressed_activities = HashSet::from(["-".into(), "Fin".into()]);

    // We transform the `compression::Edge` to a `utils::Edge` in order to be able to reuse one of
    // our previous methods (`critical_path::solve`).
    let mut activities: Vec<_> = c
        .activities
        .iter()
        .map(|e| utils::Edge::new(&e.target, &e.source, e.normal_weight))
        .collect();

    let mut iterations: Vec<CriticalPathSolution> = vec![critical_path::solve(activities.clone())];
    let mut costo_actual = vec![calcula_costo_ruta(
        &costs,
        &activities,
        &compressed_activities,
    )];

    let mut a_comprimidas: Vec<String> = Vec::new();

    loop {
        let mut act_min = f64::INFINITY;
        let mut act_min_origen: String = String::new();

        for a in &iterations.last().unwrap().critical_path {
            if !compressed_activities.contains(a.as_str()) {
                act_min = costs[a.as_str()].time_cost.unwrap();
                act_min_origen = a.into();
            }
        }

        //activities = actividadesCpy.clone();

        for a in activities.iter_mut() {
            if a.source == act_min_origen {
                // Cambiar peso normal por peso de compresión
                a.weight = costs[act_min_origen.as_str()].urgent_weight;
                compressed_activities.insert(act_min_origen.clone());
            }
        }

        if act_min == f64::INFINITY || c.target_time >= iterations.last().unwrap().total_duration {
            break;
        }

        // Agrega actividad comprimida
        a_comprimidas.push(act_min_origen.clone());

        //actividadesCpy = activities.clone();
        //resultadoCPM = critical_path::solve(activities);
        iterations.push(critical_path::solve(activities.clone()));
        costo_actual.push(calcula_costo_ruta(
            &costs,
            //&actividadesCpy,
            &activities,
            &compressed_activities,
        ));
    }

    Solution {
        iterations,
        compressed_activities: a_comprimidas,
        actual_cost: costo_actual,
        time_cost: c
            .activities
            .iter()
            .map(|a| costs[a.target.as_str()].time_cost.unwrap())
            .collect(),
    }
}

fn calcula_costo_ruta(
    c: &HashMap<&str, &Edge>,
    act: &[utils::Edge],
    comprimidos: &HashSet<String>,
) -> f64 {
    let mut vistos = HashSet::with_capacity(act.len());
    let mut costo = 0.0;

    for utils::Edge { source, .. } in act {
        if vistos.insert(source) {
            let e = &c[source.as_str()];

            if comprimidos.contains(source.as_str()) {
                costo += e.urgent_cost;
            } else {
                costo += e.normal_cost;
            }
        }
    }

    costo
}

#[cfg(test)]
mod tests {
    use super::{solve, Compression, Edge};

    #[test]
    #[ignore = "Not finished yet"]
    fn solve_1() {
        let compession_payload = Compression {
            target_time: -1.0,
            activities: vec![
                Edge::new("A", "-", 8.0, 100.0, 6.0, 200.0),
                Edge::new("B", "-", 4.0, 150.0, 2.0, 350.0),
                Edge::new("C", "A", 2.0, 50.0, 1.0, 90.0),
                Edge::new("D", "B", 5.0, 100.0, 1.0, 200.0),
                Edge::new("E", "C", 3.0, 80.0, 1.0, 100.0),
                Edge::new("E", "D", 3.0, 80.0, 1.0, 100.0),
                Edge::new("F", "A", 10.0, 100.0, 5.0, 400.0),
            ],
        };

        let sol = solve(compession_payload);
        dbg!(&sol.iterations);
        assert_eq!(sol.iterations.last().unwrap().total_duration, 11.0);
        // TODO we need to double check that more of the reported fields in sol are correct.
        panic!()
    }

    // TODO add more tests
    // https://www.studocu.com/ec/document/universidad-estatal-amazonica/control-de-calidad/aceleracion-de-proyectos/7996162
}
