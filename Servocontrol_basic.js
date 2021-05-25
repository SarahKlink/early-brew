/*
* servocontrol_coffee.js
*
* servo robot arm control example
* (c)2021 by Sarah Klink
*
* important values:
*   range lever-servo: 700-2250
*   range rotation servo: 91-300 decreasing speed right, 300-515 increasing speed left
*/

"use strict";


// servo stuff
var i2cBus = require("i2c-bus");                            // import i2c driver
var Pca9685Driver = require("pca9685").Pca9685Driver;       // import bonnet pwm controller
var options = {
    i2c: i2cBus.openSync(1),
    address: 0x40,
    frequency: 50,
    debug: true
};

var pwm;

async function processflow(){    
    console.log("move stack");
        pwm.setPulseLength(0, 1200);
        await sleep(1200);                   //debug output: const result = await sleep(1200); console.log(result);
        pwm.setPulseLength(0, 2250);

    await sleep(1000);
    console.log("insert capsule");
        pwm.setPulseLength(1, 1200);
        await sleep(1200);                   //debug output: const result = await sleep(1200); console.log(result);
        pwm.setPulseLength(1, 2250);

    await sleep(1000);
    console.log("open lever");
    var tempRotation = 91;
    pwm.setPulseRange(2,0,tempRotation);
    pwm.setPulseRange(3,515-tempRotation,515);
    await sleep(3000);
    pwm.setPulseRange(2,0,0);
    pwm.setPulseRange(3,0,0);

// '    await sleep(2000);
//     console.log("close lever");
//     var tempRotation = 91;
//     pwm.setPulseRange(2,0,tempRotation);
//     pwm.setPulseRange(3,515,tempRotation,515);
//     await sleep(3000);
//     pwm.setPulseRange(2,0,0);
//     pwm.setPulseRange(3,0,0);

    console.log("Automation process completed.");
}



async function movelever(port1,port2,temp,time){                     //temp1: Geschwindigkeit 91-300 zunehmend langsamer nach rechts
    pwm.setPulseRange(port1,0,temp);
    pwm.setPulseRange(port2,515-temp,515);
    await sleep(time)
    pwm.setPulseRange(port1,0,0);
    pwm.setPulseRange(port2,0,0);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(() => {resolve('sleep of '+ms+ ' ms completed')}, ms)); //timeout von ms[ms] bis Kommentar zurück gegeneb -> Ablauf temporär blockiert
  }

//shutdown
process.on('SIGINT', function () {                          // on ctrl+c
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    pwm.dispose();
    process.exit(0);
});

// main 
pwm = new Pca9685Driver(options, function startLoop(err) {  // initialize bonnet pwm PCA9685
    if (err) {
        console.error("Error initializing PCA9685");
        process.exit(-1);
    }else{
        console.log("Initialization done.");
        processflow();
    }
});





