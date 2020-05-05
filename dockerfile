FROM node:13-alpine

RUN apk add python3 py3-pip git

COPY ./ /webgnomeclient/

RUN mkdir /config
RUN cp /webgnomeclient/config-example.json /config/config.json
RUN ln -s /config/config.json /webgnomeclient/config.json
RUN cd /webgnomeclient && npm install yarn 
RUN cd /webgnomeclient && yarn install
RUN cd /webgnomeclient && pip3 install -r requirements.txt
RUN cd /webgnomeclient/doc/ && sphinx-build -b html ./ ../dist/build/doc

VOLUME /config
EXPOSE 8080
ENTRYPOINT ["/webgnomeclient/docker_start.sh"]
