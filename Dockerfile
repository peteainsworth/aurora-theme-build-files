# Gulp (task automation) in a container
#
# USAGE :
#   docker build -t [THEME NAME] .
#   docker run --rm -it \
#     -v $(pwd):/data \
#     jdecool/gulp [COMMAND]

FROM node:0.12.7
MAINTAINER festivalrepublic

ADD package.json /

RUN npm cache clear
RUN npm install
RUN npm install -g gulp
RUN npm install -g bower

VOLUME ["/data"]
WORKDIR /data

RUN groupadd -f -g 1000 doe && \
  useradd -u 1000 -g doe doe && \
  mkdir -p /home/doe

RUN chown -R doe:doe /data && \
  chown -R doe:doe /home/doe

CMD ["-"]
ENTRYPOINT ["gulp"]
