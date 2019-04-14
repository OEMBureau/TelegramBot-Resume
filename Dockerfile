#docker build -t cv:1.2 .
FROM node:alpine

RUN  npm install -g telegraf \
&&  npm install -g nodemon 

WORKDIR /usr/src/bot

COPY ./ .

ENTRYPOINT ["/usr/src/bot/entrypoint.sh"]