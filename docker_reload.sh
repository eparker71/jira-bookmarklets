#!/bin/bash

containerid=$(docker ps | grep -v 'CONTAINER' | awk '{print $1}')
docker stop $containerid
docker build -t jira-velocity-web .
docker rm jira-velocity-app
docker run -dit --name jira-velocity-app -p 8080:80 jira-velocity-web
