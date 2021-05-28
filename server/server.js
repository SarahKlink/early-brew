// Relay info: GPIO out HIGH = relay is off. GPIO out on LOW = relay is on!
let http = require('http'); // 1 - Import Node.js 'http' module
const { MODE_BCM, DIR_HIGH } = require('rpi-gpio');
let gpio = require('rpi-gpio');
let player = require('play-sound')(opts = {}) 

const GPIO_PIN_COFFEE_SMALL = 18; // as example
const GPIO_PIN_COFFEE_BIG = 21; // as example


gpio.setMode(MODE_BCM); // BCM means pin GPIO 18 is represented by number 18 (not physical pin numbers).
gpio.setup(GPIO_PIN_COFFEE_SMALL,DIR_HIGH); // Sets GPIO pin up with start value on 'HIGH' so that the relay is off.
gpio.setup(GPIO_PIN_COFFEE_BIG,DIR_HIGH); // Sets GPIO pin up with start value on 'HIGH' so that the relay is off.

const PORT_NUMBER = 3000;

let busy = false;
let alarmRunning = false;
//global variable to stop music
let alarm;

let server = http.createServer(function (req, res) {   // 2 - creating server


    if (req.url == '/') { //check the URL of the current request
        // set response header
        res.writeHead(200, { 'Content-Type': 'text/html' });         
        // set response content    
        if(busy){
            res.write(`<html><body><h1>Welcome to morning brew</h1>Status: Busy</body></html>`);
        }
        else{
            res.write(`<html><body><h1>Welcome to morning brew</h1>Status: Ready</body></html>`);
        }
        res.end();
    }
    else if (req.url == "/big" && req.method == 'POST') {
        console.log("POST request on /big");
        if(busy == false){
            busy = true;
            res.write(`Brewing your coffee!`);
            res.end();
            //code von sarah
            // e.g. gpio.write(GPIO_PIN_COFFEE_BIG,false); false = relay on!
            busy = false;
        }
        else{
            res.write(`<html><body><h1>Welcome to morning brew</h1>Sorry, the machine is busy</body></html>`);
            res.end();
        }
    
    }
    else if (req.url == "/small" && req.method == 'POST') {
        console.log("POST request on /small");
        if(busy == false){
            busy = true;
            res.write(`Brewing your coffee!`);
            res.end();
            //code von sarah
            // e.g. gpio.write(GPIO_PIN_COFFEE_BIG,false); false = relay on!
            busy = false;
        }
        else{
            res.write(`<html><body><h1>Welcome to morning brew</h1>Sorry, the machine is busy</body></html>`);
            res.end();
        }
    }
    else if (req.url == "/alarm-on" && req.method == 'POST'){
        if(!alarmRunning){
            alarmRunning = true;
            //To fix problem of speaker only playing noise: use mpg123
            //https://askubuntu.com/questions/115369/how-to-play-mp3-files-from-the-command-line
            player.player = 'mpg123';

            alarm = player.play('./music-files/Simon Says! - one more time (feat. Devonte) [NCS Release].mp3', function(err){
                if (err) throw err
            })
            res.end('Started audio');
        }
        else{
            res.end('Audio already playing');
        }
        
    }   
    else if (req.url == "/alarm-off" && req.method == 'POST'){
        if(alarmRunning){
            if(alarm != undefined){
                alarm.kill();
                alarm = undefined;
                alarmRunning = false;
                res.end('Stopped audio');    
            }
            else{
                res.end('Audio killed by timeout')
            }
        }
        else{
            res.end('No audio playing')
        }

    }
    else
        res.end('Invalid Request!');

});

server.listen(PORT_NUMBER); //3 - listen for any incoming requests

console.log(`Node.js web server at port ${PORT_NUMBER} is running..`);