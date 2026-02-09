FROM node:20-alpine

RUN apk add python3 py3-pip git

COPY ./ /webgnomeclient/

RUN mkdir /config
RUN cp /webgnomeclient/gnome-deploy/config/webgnomeclient/config.json /config/config.json
RUN ln -s /config/config.json /webgnomeclient/config.json

WORKDIR /webgnomeclient
RUN ls ./
RUN ls /webgnomeclient
RUN pwd
RUN npm install -g grunt
RUN yarn install
RUN pip3 install -r requirements_docs.txt --break-system-packages
RUN cd doc/ && sphinx-build -b html ./ ../dist/build/doc

VOLUME /config
EXPOSE 8090
ENTRYPOINT ["./docker_start.sh"]
