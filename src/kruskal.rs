use std::collections::HashSet;

use crate::utils::{Edge, Graph, UnionFind};

use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Kruskal {
    graph: Graph,
    tree: Vec<usize>,
    weight: f64,
    graphs: Vec<String>,
}

pub(crate) fn solve(mut graph: Graph) -> Kruskal {
    graph
        .edges
        .sort_unstable_by(|a, b| a.weight.total_cmp(&b.weight));

    let mut graphs = Vec::new();
    graphs.push(dot_graph_generator(&graph.edges, "", None, false));

    let mut uf = UnionFind::new(&graph.edges);
    let mut tree: Vec<_> = Vec::new();
    let mut weight = 0.0;
    let mut path = String::new();

    for (idx, e) in graph.edges.iter().enumerate() {
        let mut cycle = String::new();

        if uf.exists_cycle(&e.source, &e.target) {
            cycle = format!("{}{}", &e.source, &e.target);
        } else {
            uf.union(&e.source, &e.target);
            tree.push(idx);
            weight += e.weight;

            path.push_str(&format!("{},{}", &e.source, &e.target));
        }

        graphs.push(dot_graph_generator(
            &graph.edges,
            &path,
            Some(&cycle),
            false,
        ));
    }

    let final_graph = dot_graph_generator(&graph.edges, &path, None, false);

    for _ in 0..5 {
        graphs.push(final_graph.clone());
    }

    Kruskal {
        graph,
        tree,
        weight,
        graphs,
    }
}

fn dot_graph_generator(edges: &[Edge], way: &str, cycle: Option<&str>, directed: bool) -> String {
    let mut graph = String::new();

    let separator = if directed {
        graph.push_str("digraph{rankdir=LR;");
        "->"
    } else {
        graph.push_str("graph{rankdir=LR;");
        "--"
    };

    let s: HashSet<_> = way
        .split(',')
        .step_by(2)
        .zip(way.split(',').skip(1).step_by(2))
        .map(|(a, b)| format!("{a}{b}"))
        .collect();

    for e in edges {
        graph.push_str(&format!(
            "{}{separator}{}[label=\"{:.3}\"",
            e.source, e.target, e.weight
        ));

        let m = format!("{}{}", e.source, e.target);

        if s.contains(&m) {
            graph.push_str(",color=blue,penwidth=3.0]");
        } else if Some(m.as_str()) == cycle {
            graph.push_str(",color=red,penwidth=3.2]");
        } else {
            graph.push(']');
        }

        graph.push(';');
    }

    graph.push('}');

    dbg!(&s);
    dbg!(&graph);

    graph
}
