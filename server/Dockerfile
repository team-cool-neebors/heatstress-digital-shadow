ARG ubuntu_dist=noble

FROM ubuntu:${ubuntu_dist}
LABEL maintainer="OPENGIS.ch <info@opengis.ch>"

ARG ubuntu_dist
ARG repo=ubuntu
ARG qgis_version

RUN apt update && apt install -y gnupg wget software-properties-common && \
    wget -qO - https://qgis.org/downloads/qgis-2022.gpg.key | gpg --no-default-keyring --keyring gnupg-ring:/etc/apt/trusted.gpg.d/qgis-archive.gpg --import && \
    chmod a+r /etc/apt/trusted.gpg.d/qgis-archive.gpg && \
    add-apt-repository "deb https://qgis.org/${repo} ${ubuntu_dist} main" && \
    apt update && \
    DEBIAN_FRONTEND=noninteractive apt install -y xvfb nginx-core spawn-fcgi qgis-server python3-qgis && \
    apt clean all

# This part is kept to allow the container to be used in
# standalone mode, without composing it with 'nginx'
ADD server/conf/qgis-server-nginx.conf /etc/nginx/nginx.conf
ADD server/start-xvfb-nginx.sh /usr/local/bin/start-xvfb-nginx.sh

ENV QGIS_PREFIX_PATH /usr
ENV QGIS_PLUGINPATH /io/plugins
ENV QGIS_SERVER_LOG_LEVEL 1
ENV QGIS_SERVER_LOG_STDERR true
ENV QGIS_SERVER_PARALLEL_RENDERING true
ENV QGIS_SERVER_MAX_THREADS 2
ENV QGIS_AUTH_DB_DIR_PATH /tmp/

ENV QT_GRAPHICSSYSTEM raster
ENV DISPLAY :99
ENV HOME /var/lib/qgis

RUN mkdir $HOME && \
    chmod 1777 $HOME
WORKDIR $HOME

EXPOSE 80/tcp 9993/tcp
CMD /usr/local/bin/start-xvfb-nginx.sh