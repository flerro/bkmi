mmi# bikemi-server

Bike-sharing data as a service in Node.js

## Example

Query stations near a lat/lng point:

```
$ curl 'localhost:8000?lng=9.1891796&lat=45.478693'
```

## Requirements

Node.js 12, no other dependencies

## Run

Locally:

```
❯ node bikemi.js
Running at http://127.0.0.1:8000
```

Docker:
```
docker build -t bikemi .
docker run --rm -p 8000:8000 --name bikemi bikemi
```

Openshift
```
oc new-app openshift/nodejs-012-centos7~https://github.com/flerro/echo-server --name=httpecho
```
