FROM node:12

RUN mkdir -p /app
WORKDIR /app
COPY src/bikemi.js bikemi.js
EXPOSE 8000
CMD [ "node", "/app/bikemi.js" ]