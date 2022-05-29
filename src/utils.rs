use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
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
