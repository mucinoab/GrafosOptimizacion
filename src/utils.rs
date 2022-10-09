use core::fmt::{self, Debug};
use std::{
    collections::HashMap,
    ops::{Index, IndexMut},
};

use serde::{Deserialize, Serialize};

#[derive(Clone, Deserialize, Serialize, PartialEq)]
pub struct Edge {
    pub source: String,
    pub target: String,
    pub weight: f64,

    // Only used in the PERT method
    pub optimistic_weight: Option<f64>,
    pub pessimistic_weight: Option<f64>,
}

impl Edge {
    pub fn new(s: &str, t: &str, weight: f64) -> Self {
        Self {
            source: s.to_owned(),
            target: t.to_owned(),
            weight,
            optimistic_weight: None,
            pessimistic_weight: None,
        }
    }

    pub fn new_pert(s: &str, t: &str, optimistic: f64, weight: f64, pessimistic: f64) -> Self {
        Self {
            source: s.to_owned(),
            target: t.to_owned(),
            weight,
            optimistic_weight: Some(optimistic),
            pessimistic_weight: Some(pessimistic),
        }
    }
}

impl Debug for Edge {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.optimistic_weight.is_some() || self.pessimistic_weight.is_some() {
            write!(
                f,
                "{{ {} {} {} {} {} }}",
                self.source,
                self.target,
                self.weight,
                self.optimistic_weight.unwrap(),
                self.pessimistic_weight.unwrap()
            )
        } else {
            write!(f, "{{ {} {} {} }}", self.source, self.target, self.weight)
        }
    }
}

pub struct UnionFind<'graph> {
    // TODO name
    // TODO implement indx and indxmut
    inner: HashMap<&'graph str, &'graph str>,
}

impl<'graph> UnionFind<'graph> {
    pub fn new(edges: &'graph [Edge]) -> Self {
        let inner = edges
            .iter()
            .flat_map(|Edge { source, target, .. }| [(source, source), (target, target)])
            .map(|(k, v)| (k.as_str(), v.as_str()))
            .collect();

        Self { inner }
    }

    pub fn union(&mut self, mut a: &'graph str, mut b: &'graph str) {
        a = self.parent(a);
        b = self.parent(b);

        if a != b {
            // Heuristic to try to insert 50/50
            if ((a.len() + b.len()) % 2) == 0 {
                self.inner.insert(a, b);
            } else {
                self.inner.insert(b, a);
            }
        }
    }

    pub fn exists_cycle(&mut self, a: &'graph str, b: &'graph str) -> bool {
        self.parent(a) == self.parent(b)
    }

    fn parent(&mut self, child: &'graph str) -> &'graph str {
        let parent = self.inner[child];

        if parent == child {
            parent
        } else {
            let new_parent = self.parent(parent);
            self.inner.insert(child, new_parent);

            new_parent
        }
    }
}

// TODO use type system to express directed and undirected graphs
#[derive(Debug, Clone)]
pub struct AdjList<'graph> {
    pub inner: HashMap<&'graph str, HashMap<&'graph str, f64>>,
    pub directed: bool,
}

impl<'graph> Index<&str> for AdjList<'graph> {
    type Output = HashMap<&'graph str, f64>;

    fn index(&self, idx: &str) -> &Self::Output {
        &self.inner[idx]
    }
}

impl<'graph> IndexMut<&str> for AdjList<'graph> {
    fn index_mut(&mut self, idx: &str) -> &mut Self::Output {
        self.inner.get_mut(idx).unwrap()
    }
}

impl<'graph> AsRef<AdjList<'graph>> for AdjList<'graph> {
    fn as_ref(&self) -> &AdjList<'graph> {
        self
    }
}

impl<'graph> From<&AdjList<'graph>> for Vec<Edge> {
    fn from(list: &AdjList) -> Self {
        let mut edges = Self::new();

        for (source, neighbours) in &list.inner {
            for (target, weight) in neighbours {
                edges.push(Edge::new(source, target, *weight));

                if !list.directed {
                    edges.push(Edge::new(target, source, *weight));
                }
            }
        }

        edges
    }
}

impl<'graph> AdjList<'graph> {
    pub fn new(graph: &'graph [Edge], directed: bool) -> Self {
        let mut inner: HashMap<&'graph str, HashMap<&'graph str, f64>> = HashMap::new();

        for Edge {
            source,
            target,
            weight,
            ..
        } in graph
        {
            inner
                .entry(source)
                .or_default()
                .entry(target)
                .or_insert(*weight);

            if !directed {
                inner
                    .entry(target)
                    .or_default()
                    .entry(source)
                    .or_insert(*weight);
            }
        }

        Self { inner, directed }
    }

    pub fn assign(&mut self, source: &'graph str, target: &'graph str, value: f64) {
        // TODO is this correct?
        let _ = *self
            .inner
            .entry(source)
            .or_default()
            .entry(target)
            .and_modify(|e| *e = value)
            .or_insert(value);
    }

    pub fn exists_path(&self, source: &str, target: &str) -> bool {
        if let Some(inner) = self.inner.get(source) {
            inner.get(target).is_some()
        } else {
            false
        }
    }
}
