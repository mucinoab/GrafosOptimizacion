use std::{
    collections::HashMap,
    ops::{Index, IndexMut},
};

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Edge {
    pub source: String,
    pub target: String,
    pub weight: f64,
}

impl Edge {
    pub fn new(s: &str, t: &str, weight: f64) -> Self {
        Self {
            source: s.to_owned(),
            target: t.to_owned(),
            weight,
        }
    }
}

pub struct UnionFind<'e> {
    // TODO name
    // TODO implement indx and indxmut
    inner: HashMap<&'e str, &'e str>,
}

impl<'e> UnionFind<'e> {
    pub fn new(edges: &'e [Edge]) -> Self {
        let inner = edges
            .iter()
            .flat_map(|Edge { source, target, .. }| [(source, source), (target, target)])
            .map(|(k, v)| (k.as_str(), v.as_str()))
            .collect();

        Self { inner }
    }

    pub fn union(&mut self, mut a: &'e str, mut b: &'e str) {
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

    pub fn exists_cycle(&mut self, a: &'e str, b: &'e str) -> bool {
        self.parent(a) == self.parent(b)
    }

    fn parent(&mut self, child: &'e str) -> &'e str {
        let parent = self.inner[child];

        if parent != child {
            let new_parent = self.parent(parent);
            self.inner.insert(child, new_parent);

            new_parent
        } else {
            parent
        }
    }
}

// TODO use type system to express directed and undirected graphs
#[derive(Debug, Clone)]
pub struct AdjList<'e> {
    pub inner: HashMap<&'e str, HashMap<&'e str, f64>>,
}

impl<'e> Index<&str> for AdjList<'e> {
    type Output = HashMap<&'e str, f64>;

    fn index(&self, idx: &str) -> &Self::Output {
        &self.inner[idx]
    }
}

impl<'e> IndexMut<&str> for AdjList<'e> {
    fn index_mut(&mut self, idx: &str) -> &mut Self::Output {
        self.inner.get_mut(idx).unwrap()
    }
}

impl<'e> AdjList<'e> {
    pub fn new(graph: &'e [Edge], directed: bool) -> Self {
        let mut inner: HashMap<&'e str, HashMap<&'e str, f64>> = HashMap::new();

        for Edge {
            source,
            target,
            weight,
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

        Self { inner }
    }
}
