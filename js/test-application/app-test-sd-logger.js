const ClassSPIbus = require('ModuleBaseSPI');
const ClassSDcard = require('ModuleBaseSDcard');

let SPIbus = {};
let sd = {};
try {
    console.log(`Action ->  new ClassBaseSPIBus()`);
    SPIbus = new ClassSPIbus();
} catch(e){
    console.log(`Code error: ${e.Code}, ${e.message}`);

}

 try{
    console.log(`Action ->  new ClassBaseSDcard({mosi:D7, miso:D2, sck:A5}, A4)`);
    sd = new ClassSDcard({mosi:D7, miso:D2, sck:A5}, A4);
} catch (e) { console.log(`Code error: ${e.Code}, ${e.message}`); }

console.log(`Action -> logfile = E.openFile('log.csv', 'a')`);
let logfile = E.openFile('log.csv', 'a');
let f = () => {
    console.log('Write data to logfile: ' + logfile.write(getTime() + "," + E.getTemperature() + "\r\n"));
};
console.log(`Action -> digitalWrite(LED1, 1)`);
digitalWrite(LED1, 1);

console.log('Descriptor logfile: ' + logfile);
f();
f();
f();
logfile.close();
logfile = undefined;

console.log(`Action -> sd.DisconnectSD()`);

sd.DisconnectSD(); // card can now be pulled out
digitalWrite(LED1, 0); // red indicator off */