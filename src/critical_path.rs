use crate::utils::{AdjList, Edge};

use std::collections::{HashMap, HashSet};

use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct CriticalPathSolution {
    activities: Vec<Activity>,
    critical_path: Vec<String>,
    total_duration: f64,
}

#[derive(Debug, Serialize, Clone)]
pub struct Activity {
    name: String,
    duration: f64,
    succesors: Vec<String>,

    /// Tiempo más próximo izquierda
    closest_lhs: f64,

    /// Tiempo más próximo derecha
    closest_rhs: f64,

    /// Tiempo más lejano izquierda
    farthest_lhs: f64,

    /// Tiempo más próximo derecha
    farthest_rhs: f64,
}

impl Activity {
    fn new(name: impl Into<String>, duration: f64) -> Self {
        Self {
            name: name.into(),
            duration,
            succesors: Vec::new(),
            closest_lhs: f64::NEG_INFINITY,
            closest_rhs: f64::NEG_INFINITY,
            farthest_lhs: f64::INFINITY,
            farthest_rhs: f64::INFINITY,
        }
    }
}

pub fn solve(graph: Vec<Edge>) -> CriticalPathSolution {
    let mut actividades: HashMap<String, Activity> = graph
        .iter()
        .map(|Edge { source, weight, .. }| (source.into(), Activity::new(source, *weight)))
        .collect();

    actividades.insert(
        "-".into(),
        Activity {
            name: "-".into(),
            duration: 0.0,
            succesors: Vec::new(),
            closest_lhs: 0.0,
            closest_rhs: 0.0,
            farthest_lhs: 0.0,
            farthest_rhs: 0.0,
        },
    );

    // TODO names
    let s: HashSet<&str> = graph
        .iter()
        .flat_map(|Edge { source, target, .. }| [source.as_str(), target.as_str()])
        .collect();

    let sn: HashSet<&str> = graph
        .iter()
        .map(|Edge { target, .. }| target.as_str())
        .collect();

    let actividades_terminales: Vec<String> = s.difference(&sn).map(|&at| at.to_owned()).collect();

    // TODO we invert the table because the format of the table is different(?)
    let graph_reversed: Vec<_> = graph
        .iter()
        .map(
            |Edge {
                 source,
                 target,
                 weight,
             }| Edge::new(target, source, *weight),
        )
        .collect();

    let mut siguientes = AdjList::new(&graph_reversed, true);

    traverse_from_source_to_target("-", &mut siguientes, &mut actividades);
    let total_duration = actividades_terminales.iter().max_by(|&a, &b| {
        let a = actividades[a].closest_rhs;
        let b = actividades[b].closest_rhs;

        a.total_cmp(&b)
    });

    let mut anterior = AdjList::new(&graph, true /* TODO */);
    let total_duration = if let Some(td) = total_duration {
        actividades[td].closest_rhs
    } else {
        // It is an empty graph, or there are no terminal activities.
        0.0
    };

    // Actividades terminales
    for t in &actividades_terminales {
        let ad = actividades[t].duration;
        let a = actividades.get_mut(t).unwrap();

        a.farthest_rhs = total_duration;
        a.farthest_lhs = total_duration - ad;

        traverse_from_target_to_source(t, &mut anterior, &mut actividades);
    }

    // Ruta crítica
    let mut critical_path = Vec::new();
    let mut activities = Vec::new();

    for (k, v) in actividades {
        let mut acts = v.clone();

        if let Some(n) = siguientes.inner.get(k.as_str()) {
            acts.succesors.extend(n.keys().map(|k| k.to_string()));
        } else {
            acts.succesors.push("Fin".into());
        }

        activities.push(acts);

        if (v.closest_rhs - v.farthest_rhs).abs() < 0.005 {
            critical_path.push(k);
        }
    }

    activities.push(Activity::new("Fin", total_duration));
    critical_path.push("Fin".into());

    CriticalPathSolution {
        activities,
        critical_path,
        total_duration,
    }
}

fn traverse_from_source_to_target<'graph>(
    previous: &str,
    s: &mut AdjList<'graph>,
    n: &mut HashMap<String, Activity>,
) {
    let neighbours: Vec<_> = if let Some(n) = s.inner.get(previous) {
        n.keys().map(|k| k.to_owned()).collect()
    } else {
        return;
    };

    let duration = n[previous].closest_rhs;

    for neighbour in neighbours {
        let mm = n.get_mut(neighbour).unwrap();

        if mm.closest_lhs < duration {
            mm.closest_lhs = duration;
            mm.closest_rhs = mm.duration + duration;

            traverse_from_source_to_target(neighbour, s, n);
        }
    }
}

fn traverse_from_target_to_source<'graph>(
    previous: &str,
    s: &mut AdjList<'graph>,
    n: &mut HashMap<String, Activity>,
) {
    let neighbours: Vec<_> = if let Some(n) = s.inner.get(previous) {
        n.keys().map(|k| k.to_owned()).collect()
    } else {
        return;
    };

    let duration = n[previous].farthest_lhs;

    for neighbour in neighbours {
        let mm = n.get_mut(neighbour).unwrap();

        if mm.farthest_rhs > duration {
            mm.farthest_rhs = duration;
            mm.farthest_lhs = duration - mm.duration;

            traverse_from_target_to_source(neighbour, s, n);
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::utils::Edge;

    use super::solve;

    #[test]
    fn solve_1() {
        let graph = vec![
            Edge::new("A", "-", 2.0),
            Edge::new("B", "A", 4.0),
            Edge::new("C", "B", 1.0),
            Edge::new("C", "H", 1.0),
            Edge::new("D", "-", 6.0),
            Edge::new("E", "G", 3.0),
            Edge::new("F", "E", 5.0),
            Edge::new("G", "D", 2.0),
            Edge::new("H", "G", 2.0),
            Edge::new("I", "D", 3.0),
            Edge::new("J", "I", 4.0),
            Edge::new("K", "D", 3.0),
            Edge::new("L", "J", 5.0),
            Edge::new("L", "K", 5.0),
            Edge::new("M", "C", 2.0),
            Edge::new("M", "L", 2.0),
        ];

        let real_duration = 20.0;
        let mut real_critical_path = ["D", "I", "J", "L", "M", "-", "Fin"];
        real_critical_path.sort();

        let mut solution = solve(graph);
        solution.critical_path.sort();

        assert_eq!(solution.total_duration, real_duration);
        assert_eq!(solution.critical_path, real_critical_path);
    }

    #[test]
    fn solve_2() {
        let graph = vec![
            Edge::new("B", "-", 7.0),
            Edge::new("D", "C", 3.0),
            Edge::new("F", "B", 1.0),
            Edge::new("G", "E", 1.0),
            Edge::new("A", "-", 10.0),
            Edge::new("C", "A", 5.0),
            Edge::new("E", "D", 2.0),
            Edge::new("F", "E", 1.0),
            Edge::new("G", "F", 14.0),
        ];

        let real_duration = 35.0;
        let mut real_critical_path = ["-", "A", "D", "E", "F", "C", "G", "Fin"];
        real_critical_path.sort();

        let mut solution = solve(graph);
        solution.critical_path.sort();

        assert_eq!(solution.total_duration, real_duration);
        assert_eq!(solution.critical_path, real_critical_path);
    }

    #[test]
    fn solve_3() {
        let graph = vec![
            Edge::new("A", "-", 3.0),
            Edge::new("B", "A", 14.0),
            Edge::new("C", "A", 1.0),
            Edge::new("D", "C", 3.0),
            Edge::new("E", "C", 1.0),
            Edge::new("F", "C", 2.0),
            Edge::new("G", "D", 1.0),
            Edge::new("G", "E", 1.0),
            Edge::new("G", "F", 1.0),
            Edge::new("H", "G", 1.0),
            Edge::new("I", "H", 3.0),
            Edge::new("J", "H", 2.0),
            Edge::new("K", "I", 2.0),
            Edge::new("K", "J", 2.0),
            Edge::new("L", "K", 2.0),
            Edge::new("M", "L", 4.0),
            Edge::new("N", "L", 1.0),
            Edge::new("O", "B", 3.0),
            Edge::new("O", "M", 3.0),
            Edge::new("O", "N", 3.0),
        ];

        let real_duration = 23.0;
        let mut real_critical_path = ["L", "G", "I", "H", "M", "-", "D", "C", "K", "O", "A", "Fin"];
        real_critical_path.sort();

        let mut solution = solve(graph);
        solution.critical_path.sort();

        assert_eq!(solution.total_duration, real_duration);
        assert_eq!(solution.critical_path, real_critical_path);
    }

    #[test]
    fn solve_4() {
        let graph = vec![
            Edge::new("A", "-", 5.0),
            Edge::new("B", "-", 2.0),
            Edge::new("C", "A", 2.0),
            Edge::new("D", "A", 3.0),
            Edge::new("E", "B", 1.0),
            Edge::new("F", "C", 1.0),
            Edge::new("F", "D", 1.0),
            Edge::new("G", "E", 4.0),
        ];

        let real_duration = 9.0;
        let mut real_critical_path = ["A", "D", "F", "-", "Fin"];
        real_critical_path.sort();

        let mut solution = solve(graph);
        solution.critical_path.sort();

        assert_eq!(solution.total_duration, real_duration);
        assert_eq!(solution.critical_path, real_critical_path);
    }
}
