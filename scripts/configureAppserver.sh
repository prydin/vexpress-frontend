#!/bin/bash
set -e
mkdir /opt/vexpress-frontend
chown $1 /opt/vexpress-frontend
cd /opt/vexpress-frontend
mv /tmp/application.properties .
wget --auth-no-challenge --user=$2 --password=$3 $4/artifact/build/libs/vexpress-frontend-$5.jar -O vexpress-frontend.jar
mv /tmp/vexpress-frontend.service /etc/systemd/system
chmod 664 /etc/systemd/system/vexpress-frontend.service

# Wait until Java is installed
until [ -f /usr/bin/java ]; do
  sleep 10
done

systemctl enable vexpress-frontend
systemctl start vexpress-frontend
