FROM node:12

COPY bikemi.js server.js
EXPOSE 8000
CMD [ "node", "server.js" ]