FROM node:12

RUN mkdir -p /app
WORKDIR /app
COPY src/bikemi.js bikemi.js
COPY src/package.json package.json
EXPOSE 8000
CMD [ "node", "/app/bikemi.js" ]