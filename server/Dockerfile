FROM ubuntu:22.04 as builder
# use ubuntu instead of rust to avoid opencv version mismatch between builder and runner

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
	llvm \
	libclang-dev \
	clang \
	libopencv-dev \
	pkg-config \
	curl \
	libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /server
COPY ./Cargo.toml ./Cargo.toml
COPY ./src/ ./src/
RUN cargo build --release


FROM ubuntu:22.04 as server

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    libssl-dev \
    ca-certificates \
	libopencv-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /server
COPY --from=builder /server/target/release/card_collector ./card_collector
COPY ./Config.json ./Config.json
COPY ./sqlfiles/ ./sqlfiles/
COPY ./static/ ./static/
COPY ./media/ ./media/
COPY ./media-types/ ./media-types/

ENV LD_LIBRARY_PATH=/usr/lib:$LD_LIBRARY_PATH

EXPOSE 8080
CMD ["./card_collector"]
