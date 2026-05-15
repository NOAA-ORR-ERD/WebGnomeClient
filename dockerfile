FROM node:20-alpine

RUN apk add python3 py3-pip git

COPY ./ /webgnomeclient/

RUN mkdir /config
RUN ln -s /webgnomeclient/config-example.json /webgnomeclient/config.json

WORKDIR /webgnomeclient
RUN pwd
RUN npm install 
RUN npm install -g grunt
ENV PIP_ROOT_USER_ACTION=ignore
ENV PIP_BREAK_SYSTEM_PACKAGES=1
RUN pip3 install -r requirements_docs.txt
RUN cd doc/ && sphinx-build -b html ./ ../dist/build/doc

VOLUME /config
EXPOSE 8090
ENTRYPOINT ["./docker_start.sh"]
