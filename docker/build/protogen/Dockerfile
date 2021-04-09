

ARG iso_id=latest
FROM ubuntu:${iso_id}

# Add sawtooth repo
RUN echo "deb http://repo.sawtooth.me/ubuntu/ci xenial universe" >> /etc/apt/sources.list \
 && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 8AA7AF1F1091A5FD \
 && apt-get update \
 && apt-get install -y -q --allow-downgrades \
    python3 \
    libprotobuf12 \
    python3-grpcio \
    python3-grpcio-tools \
    python3-pkg-resources \
    python3-protobuf \
    python3-six

CMD [ "/project/sawtooth-supply-chain/bin/protogen" ]
