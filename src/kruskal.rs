use crate::utils::{Edge, UnionFind};

use std::{collections::HashSet, fmt::Write};

/// Kruskal’s Minimum Spanning Tree
#[derive(Debug, serde::Serialize)]
pub struct KruskalSolution {
    tree_weight: f64,
    dot_graph_frames: Vec<String>,
    // TODO edges that make the tree
}

pub(crate) fn solve(mut graph: Vec<Edge>) -> KruskalSolution {
    graph.sort_unstable_by(|a, b| a.weight.total_cmp(&b.weight));

    let mut uf = UnionFind::new(&graph);
    let mut tree = HashSet::with_capacity(graph.len());
    let mut cycle = None;

    let mut graphs = Vec::new();
    let mut total_weight = 0.0;

    graphs.push(dot_graph_generator(&graph, &tree, None, false));

    for Edge {
        source,
        target,
        weight,
    } in &graph
    {
        if uf.exists_cycle(source, target) {
            cycle = Some((source.as_str(), target.as_str()));
        } else {
            uf.union(source, target);
            total_weight += weight;

            tree.insert((source.as_str(), target.as_str()));
        }

        graphs.push(dot_graph_generator(&graph, &tree, cycle, false));
    }

    let final_graph = dot_graph_generator(&graph, &tree, None, false);
    graphs.extend(vec![final_graph; 5]);

    KruskalSolution {
        tree_weight: total_weight,
        dot_graph_frames: graphs,
    }
}

/// Builds a dot graph for the given sets of elements
fn dot_graph_generator(
    edges: &[Edge],
    tree: &HashSet<(&str, &str)>,
    cycle: Option<(&str, &str)>,
    directed: bool,
) -> String {
    const BLUE_LINE: &str = ",color=blue,penwidth=3.0";
    const RED_LINE: &str = ",color=red,penwidth=3.2";
    const LINE_TERMINATOR: &str = "];";

    let mut graph = String::new();

    // TODO is anyone else using this with directed true?
    let separator = if directed {
        graph.push_str("digraph{rankdir=LR;");
        "->"
    } else {
        graph.push_str("graph{rankdir=LR;");
        "--"
    };

    for Edge {
        source,
        target,
        weight,
    } in edges
    {
        write!(
            &mut graph,
            "{}{separator}{}[label=\"{:.3}\"",
            source, target, weight
        )
        .unwrap();

        let segment = (source.as_str(), target.as_str());

        if tree.contains(&segment) {
            graph.push_str(BLUE_LINE);
        } else if Some(segment) == cycle {
            graph.push_str(RED_LINE);
        }

        graph.push_str(LINE_TERMINATOR);
    }

    graph.push('}');

    graph
}

#[cfg(test)]
mod tests {
    use crate::{kruskal, utils::Edge};

    #[test]
    fn solve_simple() {
        let graph = vec![
            Edge::new("A", "B", 6.0),
            Edge::new("A", "C", 3.0),
            Edge::new("B", "D", 2.0),
            Edge::new("B", "T", 5.0),
            Edge::new("C", "B", 4.0),
            Edge::new("C", "D", 3.0),
            Edge::new("D", "T", 2.0),
            Edge::new("S", "A", 7.0),
            Edge::new("S", "C", 8.0),
        ];

        let solution = kruskal::solve(graph);

        assert_eq!(solution.tree_weight, 17.0);
    }

    #[test]
    fn solve_bigger() {
        let graph = vec![
            Edge::new("V0", "V1", 4.0),
            Edge::new("V0", "V1", 4.0),
            Edge::new("V0", "V7", 8.0),
            Edge::new("V0", "V7", 8.0),
            Edge::new("V1", "V2", 8.0),
            Edge::new("V1", "V2", 8.0),
            Edge::new("V1", "V7", 11.0),
            Edge::new("V1", "V7", 11.0),
            Edge::new("V2", "V3", 7.0),
            Edge::new("V2", "V3", 7.0),
            Edge::new("V2", "V5", 4.0),
            Edge::new("V2", "V5", 4.0),
            Edge::new("V2", "V8", 2.0),
            Edge::new("V2", "V8", 2.0),
            Edge::new("V3", "V4", 9.0),
            Edge::new("V3", "V4", 9.0),
            Edge::new("V5", "V3", 14.0),
            Edge::new("V5", "V3", 14.0),
            Edge::new("V5", "V4", 10.0),
            Edge::new("V5", "V4", 10.0),
            Edge::new("V6", "V5", 2.0),
            Edge::new("V6", "V5", 2.0),
            Edge::new("V7", "V6", 1.0),
            Edge::new("V7", "V6", 1.0),
            Edge::new("V7", "V8", 7.0),
            Edge::new("V7", "V8", 7.0),
            Edge::new("V8", "V6", 6.0),
            Edge::new("V8", "V6", 6.0),
        ];

        let solution = kruskal::solve(graph);

        assert_eq!(solution.tree_weight, 37.0);
    }
}
