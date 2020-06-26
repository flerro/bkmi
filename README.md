# bikemi-server

Bike-sharing data as a service in Node.js, for demo purposes 

**DO NOT USE IN PRODUCTION SOFTWARE**

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
oc new-app nodejs~https://github.com/flerro/bkmi --name=bikemi
```
