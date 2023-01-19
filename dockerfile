FROM node:14-alpine

RUN apk add python3 py3-pip git

COPY ./ /webgnomeclient/

RUN mkdir /config
RUN cp /webgnomeclient/gnome-deploy/config/webgnomeclient/config.json /config/config.json
RUN ln -s /config/config.json /webgnomeclient/config.json

WORKDIR /webgnomeclient
RUN npm install yarn && npm install -g grunt
RUN yarn install
RUN pip3 install -r requirements.txt
RUN cd doc/ && sphinx-build -b html ./ ../dist/build/doc

VOLUME /config
EXPOSE 8080
ENTRYPOINT ["./docker_start.sh"]
