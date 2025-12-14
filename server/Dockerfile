FROM rust:1.85 as builder

RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-dev \
    libssl-dev \
    pkg-config \
    ca-certificates

ENV PYO3_PYTHON=/usr/bin/python3.11

WORKDIR server
COPY ./Cargo.toml ./Cargo.toml
COPY ./src/ ./src/
RUN cargo build --release

FROM ubuntu:18.04
RUN apt-get update -y && apt-get install -y libssl-dev ca-certificates
WORKDIR server
COPY --from=builder /server/target/release/card_collector ./card_collector
COPY ./Config.json ./Config.json
COPY ./sqlfiles/ ./sqlfiles/
COPY ./static/ ./static/
EXPOSE 80
CMD ["./card_collector"]
