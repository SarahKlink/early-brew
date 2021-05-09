// Relay info: GPIO out HIGH = relay is off. GPIO out on LOW = relay is on!
var http = require('http'); // 1 - Import Node.js 'http' module
const { MODE_BCM, DIR_HIGH } = require('rpi-gpio');
var gpio = require('rpi-gpio');

const GPIO_PIN_COFFEE_SMALL = 18; // as example
const GPIO_PIN_COFFEE_BIG = 21; // as example


gpio.setMode(MODE_BCM); // BCM means pin GPIO 18 is represented by number 18 (not physical pin numbers).
gpio.setup(GPIO_PIN_COFFEE_SMALL,DIR_HIGH); // Sets GPIO pin up with start value on 'HIGH' so that the relay is off.
gpio.setup(GPIO_PIN_COFFEE_BIG,DIR_HIGH); // Sets GPIO pin up with start value on 'HIGH' so that the relay is off.

const PORT_NUMBER = 3000;

var server = http.createServer(function (req, res) {   // 2 - creating server


    if (req.url == '/') { //check the URL of the current request
        
        // set response header
        res.writeHead(200, { 'Content-Type': 'text/html' });         
        // set response content    
        res.write(`<html><body><p>Welcome to morning brew</p></body></html>`);
        res.end();
    
    }
    else if (req.url == "/big" && req.method == 'POST') {
        //code von sarah
        // e.g. gpio.write(GPIO_PIN_COFFEE_BIG,false); false = relay on!
        res.end();
    
    }
    else if (req.url == "/small" && req.method == 'POST') {
        //code von sarah
        // see example for /big
        res.end();
    
    }
    else
        res.end('Invalid Request!');

});

server.listen(PORT_NUMBER); //3 - listen for any incoming requests

console.log(`Node.js web server at port ${PORT_NUMBER} is running..`);