
ARG iso_id=latest
FROM ubuntu:xenial

RUN echo "deb http://repo.sawtooth.me/ubuntu/0.8/stable xenial universe" >> /etc/apt/sources.list \
 && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 8AA7AF1F1091A5FD \
 && apt-get update \
 && apt-get install -y -q --allow-downgrades \
    git \
    python3 \
    python3-colorlog \
    python3-protobuf \
    python3-sawtooth-sdk \
    python3-stdeb

ENV VERSION=AUTO_STRICT
CMD [ "/project/sawtooth-supply-chain/docker/build/processor/processor" ]
