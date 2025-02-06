FROM --platform=linux/amd64 golang:1.23-bookworm

RUN apt-get update -y && \
    apt-get install -yq --no-install-recommends \
            ca-certificates \
            wget \
            jq \
            procps \
            curl \
            vim \
            inetutils-ping binutils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/cache/apt/archive/*.deb

WORKDIR /clabernetes

COPY go.mod go.mod
COPY go.sum go.sum

RUN go mod download

ENTRYPOINT ["sleep", "infinity"]
