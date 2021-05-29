// Relay info: GPIO out HIGH = relay is off. GPIO out on LOW = relay is on!
let http = require('http'); // 1 - Import Node.js 'http' module
const { MODE_BCM, DIR_HIGH } = require('rpi-gpio'); // to control relay
let gpio = require('rpi-gpio');   // to control relay
let player = require('play-sound')(opts = {})  // to play music
fs = require('fs'); // to store coffee count



// servo stuff
var i2cBus = require("i2c-bus");                            // import i2c driver
var Pca9685Driver = require("pca9685").Pca9685Driver;       // import bonnet pwm controller
var options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 50,
    debug: true
};

// CHANGE THESE
const PIN_COFFEE_SMALL = 18; // as example
const PIN_COFFEE_BIG = 21; // as example


// gpio.setMode(MODE_BCM); // BCM means pin GPIO 18 is represented by number 18 (not physical pin numbers).
// gpio.setup(GPIO_PIN_COFFEE_SMALL,DIR_HIGH); // Sets GPIO pin up with start value on 'HIGH' so that the relay is off.
// gpio.setup(GPIO_PIN_COFFEE_BIG,DIR_HIGH); // Sets GPIO pin up with start value on 'HIGH' so that the relay is off.

const PORT_NUMBER = 3000;

let busy = false;

// Music - Alarm
let alarmRunning = false;
// global variable to stop music
let alarm;
let coffeeCount = 0;


function loadCoffeeCount() {
    fs.readFile('./coffee_count.txt', (err, data) => {
        if (err) {
          console.error(err)
        }
        else{
            console.log("coffee count loaded: "+data);
            if(data == ''){
                coffeeCount = 0;
            }
            else{
                coffeeCount = parseInt(data);
            }    
        }
      })
}


function saveCoffeeCount() {
    fs.writeFile('./coffee_count.txt', coffeeCount.toString(), function (err) {
        if (err) return console.log(err);
        console.log('Saved coffee count: '+coffeeCount);
    });
}

loadCoffeeCount();
saveCoffeeCount();

function increaseCoffeeCountOne() {
    coffeeCount = coffeeCount + 1;
    saveCoffeeCount();
}

function playAlarmSound() {
    //To fix problem of speaker only playing noise: use mpg123
    //https://askubuntu.com/questions/115369/how-to-play-mp3-files-from-the-command-line
    player.player = 'mpg123';

    alarm = player.play('./music-files/Simon Says! - one more time (feat. Devonte) [NCS Release].mp3', function(err){
        if (err) throw err
    })
}

async function processflowSmall(){ 
    increaseCoffeeCountOne();   
    openlever();
    insertcapsule();
    closelever();
    pressButtonCoffeeSmall();
    // playAlarmSound(); Either activate this for always alarm when coffee or use API endpoint and homekit automation to trigger alarm and coffee in morning
    if(coffeeCount == 4){
        resetstack();
    }
    else{
        movestack();
    }
    console.log("[Small] Automation process completed.");
}

async function processflowBig(){    
    increaseCoffeeCountOne();   
    openlever();
    insertcapsule();
    closelever();
    pressButtonCoffeeBig();
    // playAlarmSound(); Either activate this for always alarm when coffee or use API endpoint and homekit automation to trigger alarm and coffee in morning
    if(coffeeCount == 4){
        resetstack();
    }
    else{
        movestack();
    }
    console.log("[Big] Automation process completed.");
}

async function openlever(){
    console.log("open lever");
    var tempRotation = 91;
    pwm.setPulseRange(2,0,tempRotation);
    pwm.setPulseRange(3,515-tempRotation,515);
    await sleep(3000);
    pwm.setPulseRange(2,0,0);
    pwm.setPulseRange(3,0,0);
}

async function closelever(){ 
    console.log("close lever");
    var tempRotation = 91;
    pwm.setPulseRange(2,0,tempRotation);
    pwm.setPulseRange(3,515,tempRotation,515);
    await sleep(3000);
    pwm.setPulseRange(2,0,0);
    pwm.setPulseRange(3,0,0);
}

async function insertcapsule(){ 
    console.log("insert capsule");
    pwm.setPulseLength(1, 1200);
    await sleep(1200);                   
    pwm.setPulseLength(1, 2250);
}

async function resetstack(){ //if globale var Position stack == 4
    pwm.setPulseRange(4,0,0);
    coffeeCount = 0;
    saveCoffeeCount();
    await sleep(3000);

}async function movestack(){ 
    pwm.setPulseRange(4,0,0);
    await sleep(3000);
}

async function pressButtonCoffeeBig() {
    pwm.channelOff(PIN_COFFEE_BIG);
    await sleep(600);
    pwm.channelOn(PIN_COFFEE_BIG);
}

async function pressButtonCoffeeSmall() {
    pwm.channelOff(PIN_COFFEE_SMALL);
    await sleep(600);
    pwm.channelOn(PIN_COFFEE_SMALL);
}

function sleep(ms) {                    //debug output: const result = await sleep(1200); console.log(result);
    return new Promise(resolve => setTimeout(() => {resolve('sleep of '+ms+ ' ms completed')}, ms)); //timeout von ms[ms] bis Kommentar zurück gegeneb -> Ablauf temporär blockiert
  }

//shutdown
process.on('SIGINT', function () {                          // on ctrl+c
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    pwm.dispose();
    process.exit(0);
});

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
            processflowBig();
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
            processflowSmall();
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
            playAlarmSound();
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

let pwm = new Pca9685Driver(options, function startLoop(err) {  // initialize bonnet pwm PCA9685
    if (err) {
        console.error(err);
        process.exit(-1);
    }
    else{
        console.log("Initialization done.");        
    }
});


server.listen(PORT_NUMBER); //3 - listen for any incoming requests
console.log(`Node.js web server at port ${PORT_NUMBER} is running..`);