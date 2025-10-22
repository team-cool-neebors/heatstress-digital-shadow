cleanup() {
    # SIGTERM is propagated to children.
    # Timeout is managed directly by Docker, via it's '-t' flag:
    # if SIGTERM does not teminate the entrypoint, after the time
    # defined by '-t' (default 10 secs) the container is killed
    kill $XVFB_PID $QGIS_PID $NGINX_PID
}

waitfor() {
    # Make startup syncronous
    while ! pidof $1 >/dev/null; do
        sleep 1
    done
    pidof $1
}

trap cleanup SIGINT SIGTERM

# always convert $SKIP_NGINX to lowercase
typeset -l SKIP_NGINX

rm -f /tmp/.X99-lock
# Update font cache
fc-cache
/usr/bin/Xvfb :99 -ac -screen 0 1280x1024x16 +extension GLX +render -noreset >/dev/null &
XVFB_PID=$(waitfor /usr/bin/Xvfb)
# Do not start NGINX if environment variable '$SKIP_NGINX' is set but not '0' or 'false'
# this may be useful in production where an external reverse proxy is used
if [ -z "$SKIP_NGINX" ] || [ "$SKIP_NGINX" == "false" ] || [ "$SKIP_NGINX" == "0" ]; then
    nginx
    NGINX_PID=$(waitfor /usr/sbin/nginx)
fi
# To avoid issues with GeoPackages when scaling out QGIS should not run as root
spawn-fcgi -n -u ${QGIS_USER:-www-data} -g ${QGIS_USER:-www-data} -d ${HOME:-/var/lib/qgis} -P /run/qgis.pid -p 9993 -- /usr/lib/cgi-bin/qgis_mapserv.fcgi &
QGIS_PID=$(waitfor qgis_mapserv.fcgi)
wait $QGIS_PID