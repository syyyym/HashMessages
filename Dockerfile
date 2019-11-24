# docker build -t node-vanilla -f Dockerfile .
FROM node
WORKDIR /root/
CMD bash
# docker run -it --rm -p 8080:8080 -v $PWD:/root/ node-vanilla