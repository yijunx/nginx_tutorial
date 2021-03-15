FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 9999

CMD [ "node", "app.js" ]

# docker build -t sample_node_app .
# docker run -p 2222:9999 -e APPID=2222 -d sample_node_app
# docker run -p 3333:9999 -e APPID=3333 -d sample_node_app
# docker run -p 4444:9999 -e APPID=4444 -d sample_node_app
# docker run -p 5555:9999 -e APPID=5555 -d sample_node_app