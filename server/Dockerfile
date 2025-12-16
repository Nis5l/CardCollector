FROM rust:1.85 as builder

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
	llvm \
	libclang-dev \
	clang \
	libopencv-dev \
	pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /server
COPY ./Cargo.toml ./Cargo.toml
COPY ./src/ ./src/
RUN cargo build --release

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
	libopencv-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /server
COPY --from=builder /server/target/release/card_collector ./card_collector
COPY ./Config.json ./Config.json
COPY ./sqlfiles/ ./sqlfiles/
COPY ./static/ ./static/

ENV LD_LIBRARY_PATH=/usr/lib:$LD_LIBRARY_PATH

EXPOSE 8080
CMD ["./card_collector"]
