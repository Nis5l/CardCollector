FROM rust:1.85 as builder

RUN apt-get update && apt-get install -y \
    libssl-dev \
    ca-certificates \
    python3.11 \
    python3.11-venv \
    python3.11-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

ENV PYO3_PYTHON=/usr/bin/python3.11

WORKDIR /server
COPY ./Cargo.toml ./Cargo.toml
COPY ./src/ ./src/
RUN cargo build --release

FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    libssl-dev \
    ca-certificates \
    python3.11 \
    python3.11-venv \
    python3.11-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /server

COPY --from=builder /server/target/release/card_collector ./card_collector

COPY ./Config.json ./Config.json
COPY ./sqlfiles/ ./sqlfiles/
COPY ./static/ ./static/

EXPOSE 8080
CMD ["./card_collector"]
