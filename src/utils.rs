use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Graph {
    pub edges: Vec<Edge>,
}

#[derive(Deserialize, Serialize)]
pub struct Edge {
    pub source: String,
    pub target: String,
    pub weight: f64,
}

pub struct UnionFind {
    inner: HashMap<String, String>, // TODO name
}

impl UnionFind {
    pub fn new(edges: &[Edge]) -> Self {
        let inner: HashMap<String, String> = edges
            .iter()
            .flat_map(|Edge { source, target, .. }| [(source, target), (target, source)])
            .map(|(k, v)| (k.into(), v.into()))
            .collect();

        Self { inner }
    }

    pub fn union(&mut self, a: &str, b: &str) {
        let a = self.parent(a);
        let b = self.parent(b);

        if a != b {
            // Euristic to insert 50/50
            if ((a.len() + b.len()) % 2) == 0 {
                self.inner.entry(a).insert_entry(b);
            } else {
                self.inner.entry(b).insert_entry(a);
            }
        }
    }

    fn parent(&mut self, child: &str) -> String {
        // TODO do less accesses to inner

        if self.inner[child] != child {
            let p = self.parent(child);
            self.inner.insert(child.to_string(), p);
        }

        self.inner[child].to_owned()
    }

    pub fn exists_cycle(&mut self, a: &str, b: &str) -> bool {
        self.parent(a) == self.parent(b)
    }
}
