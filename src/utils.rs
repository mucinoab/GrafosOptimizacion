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
    pub directed: bool,
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

impl<'e> AsRef<AdjList<'e>> for AdjList<'e> {
    fn as_ref(&self) -> &AdjList<'e> {
        self
    }
}

impl<'e> From<&AdjList<'e>> for Vec<Edge> {
    fn from(list: &AdjList) -> Self {
        let mut edges = Vec::new();

        for (source, neighbours) in list.inner.iter() {
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

        Self { inner, directed }
    }

    pub fn assign(&mut self, source: &'e str, target: &'e str, value: f64) {
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
