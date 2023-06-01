# From: https://endler.dev/2020/rust-compile-times/#bonus-speed-up-rust-docker-builds-whale

# Step 1: Compute a recipe file
FROM rust:1.69-slim-bullseye as planner
WORKDIR grafos_optimizacion
RUN cargo install cargo-chef
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# Step 2: Cache project dependencies
FROM rust:1.69-slim-bullseye as cacher
WORKDIR grafos_optimizacion
RUN cargo install cargo-chef
COPY --from=planner /grafos_optimizacion/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json

# Step 3: Build the binary
FROM rust:1.69-slim-bullseye as builder
WORKDIR grafos_optimizacion
COPY . .
# Copy over the cached dependencies from above
COPY --from=cacher /grafos_optimizacion/target target
COPY --from=cacher /usr/local/cargo /usr/local/cargo
RUN RUSTFLAGS="-C target-cpu=native" cargo build --release

FROM debian:bullseye-slim
RUN mkdir js
COPY ./js/*.js ./js/*.wasm ./js
COPY *.html *.css *.ico .
COPY --from=builder /grafos_optimizacion/target/release/grafos_optimizacion .
ENTRYPOINT ./grafos_optimizacion
