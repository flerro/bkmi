/**
 * 
 *  Simple scraper for Milan Bikesharing service
 *  https://www.bikemi.com/
 * 
 */

const https = require('https');

const retrieveStations = () => 
    new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            hostname: 'www.bikemi.com',
            path: '/it/mappa-stazioni.aspx',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Android 7.1.2; Pixel Build/NHG47Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.9 NTENTBrowser/3.7.0.496 (IWireless-US) Mobile Safari/537.36',
                "Cookie": ['Language=it-IT']
            }
        };

        let req = https.request(options, res => {            
            if (res.statusCode !== 200) {
                reject(new Error(`Request Failed, Status Code: ${res.statusCode}`));
            }

            let htmlContent = '';
            res.on('data', (chunk) => { htmlContent += chunk; });
            res.on('end', () => resolve(parseBycicleData(htmlContent)));
        });

        req.end();
        req.on('error', err => reject(err));
    });

const distance = (lat1, lon1, lat2, lon2) => {
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
};

const parseBycicleData = content => {
    const lineBreak = /\r?\n/
    const findStation = /GoogleMap.addMarker/;
    const tags = /<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/

    const notEmpty = e => e != undefined && e && e.trim() && (e.indexOf('=') < 0)

    let stations = [];

    content.split(lineBreak).forEach(line => {
        let match = findStation.exec(line);
        if (match) {
            let tokens = line.replace(/'/g,'').replace(/\\u003c/g,'<').replace(/\\u003e/g,'>')
                                .replace(/\\r\\n/g, '').replace(/\\/g,'').replace(');', '')
                                .split(',').slice(1); 

            let rawData = tokens[3].split(tags).filter(notEmpty).slice(4);

            stations.push({
                    lng: parseFloat(tokens[1].substr(0, 10)),
                    lat: parseFloat(tokens[0].substr(0, 10)),
                    name: tokens[2].trim(),
                    bikes: {
                        standard: parseInt(rawData[1]),
                        electric: parseInt(rawData[4]),
                        babySeat: parseInt(rawData[7])
                    },
                    emptySlots: parseInt(rawData[2])
                });
        }
    });

    return stations;
};

const near = async (lat, lng) => {
    const data = await retrieveStations();
    data.forEach(e => e.distance = distance(lat, lng, e.lat, e.lng));
    return data.filter(e => e.distance <= 0.35);
}


// -------------------------------------------- HTTP server

const http = require('http');
const server = http.createServer();

server.on('request', async (req, res) => {
    if (req.method == 'GET') {        
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({"message": "alive"}));
    } else {
        let body = ''
        req.on('data', (data) => body += data);
        req.on('end', async () => {
            try {
                const qs = JSON.parse(body);
                if (!qs.lat || !qs.lng) {
                    result = {"error": "Missing lat and/or lng"}
                } else {
                    console.log(`Bike stations near: (${qs.lat},${qs.lng})`)
                    const stations = await near(qs.lat, qs.lng)      
                    result = {"count": stations.length, "stations": stations};
                    console.log(`Found #${stations.length} bike stations`)
                } 
                
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(result));
        
            } catch (e) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end("{'error': " + e.toString() + "}");
            }
        });
    }
});

let port = process.env.OPENSHIFT_NODEJS_PORT || 8000
let address = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'

server.listen(port, address, () => {
    const address = server.address().address;
    const port = server.address().port;
    console.log(`Running at http://${address}:${port}`);
});

