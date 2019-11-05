FROM gitlab.orr.noaa.gov:5002/centos-conda:latest

RUN yum update -y && yum -y install node npm

COPY ./ /webgnomeclient/

RUN mkdir /config
RUN cp /webgnomeclient/config-example.json /config/config.json
RUN ln -s /config/config.json /webgnomeclient/config.json
RUN cd /webgnomeclient && npm install && npm install -g grunt 
RUN cd /webgnomeclient && grunt install 
RUN cd /webgnomeclient && pip install -r requirements.txt
RUN cd /webgnomeclient/doc/ && sphinx-build -b html ./ ../dist/build/doc

VOLUME /config
EXPOSE 8080
ENTRYPOINT ["/webgnomeclient/docker_start.sh"]
