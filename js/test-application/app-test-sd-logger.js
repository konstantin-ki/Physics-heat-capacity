const ClassSPIbus = require('ModuleBaseSPI');
const ClassSDcard = require('ModuleBaseSDcard');

let SPIbus = {};
let sd = {};
try {
    console.log(`DEBUG>> new ClassBaseSPIBus()`);
    SPIbus = new ClassSPIbus();
} catch(e){
    console.log(`ERROR>> ${e.message}`);
}
try{
    console.log(`DEBUG>> new ClassBaseSDcard({mosi:D7, miso:D2, sck:A5}, A4)`);
    sd = new ClassSDcard({mosi:D7, miso:D2, sck:A5}, A4);
} catch (e) { console.log(`ERROR>> ${e.message}`); }

console.log(`DEBUG>> logfile = E.openFile('log.csv', 'a')`);
let logfile = E.openFile('log.csv', 'a');
let f = () => {
    console.log('Write data to logfile: ' + logfile.write(getTime() + "," + E.getTemperature() + "\r\n"));
};
console.log(`DEBUG>> digitalWrite(LED1, 1)`);
digitalWrite(LED1, 1);

console.log(`DEBUG>> descriptor logfile:  + ${logfile}`);
f();
f();
f();
logfile.close();
logfile = undefined;

console.log(`DEBUG>> sd.DisconnectSD()`);

sd.DisconnectSD(); // card can now be pulled out
digitalWrite(LED1, 0); // led indicator off