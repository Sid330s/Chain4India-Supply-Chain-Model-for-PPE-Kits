
# Description:
#   Builds server and client node dependencies, creating a server image
#   which can be run with root context

FROM ubuntu:xenial

LABEL "install-type"="mounted"

# Install Node and Ubuntu dependencies
RUN apt-get update && apt-get install -y -q --no-install-recommends \
    curl \
    ca-certificates \
    pkg-config \
    build-essential \
    libzmq3-dev \
 && curl -s -S -o /tmp/setup-node.sh https://deb.nodesource.com/setup_8.x \
 && chmod 755 /tmp/setup-node.sh \
 && /tmp/setup-node.sh \
 && apt-get install nodejs -y -q \
 && rm /tmp/setup-node.sh \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/* \
 && npm install -g prebuild-install

WORKDIR /sawtooth-supply-chain/server

COPY server/package.json .
RUN npm install

EXPOSE 3000/tcp

CMD ["/usr/bin/node" "index.js"]
