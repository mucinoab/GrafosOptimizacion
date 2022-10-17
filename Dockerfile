FROM rust:1.64-slim-bullseye as build
 
RUN cargo new --bin grafos_optimizacion
WORKDIR /grafos_optimizacion
 
# Copy over all the necesary files of the source code to build
COPY ./Cargo.lock ./Cargo.toml .
COPY ./src ./src

RUN RUSTFLAGS="-C target-cpu=native" cargo build --release


FROM debian:bullseye-slim
 
# Copy all the static files and the compiled binary
RUN mkdir js
COPY ./js/*.js ./js/*.wasm ./js
COPY *.html *.css *.ico .
COPY --from=build /grafos_optimizacion/target/release/grafos_optimizacion .

ENTRYPOINT ./grafos_optimizacion
