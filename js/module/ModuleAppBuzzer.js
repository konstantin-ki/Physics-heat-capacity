const ClassBuzzerType       = require('https://raw.githubusercontent.com/konstantin-ki/Physics-heat-capacity/ver2/js/module/ModuleBuzzerType.min.js');
const ClassBuzzerTypePlay   = require('https://raw.githubusercontent.com/konstantin-ki/Physics-heat-capacity/ver2/js/module/ModuleBuzzerTypePlay.min.js');
const ClassBuzzer           = require('https://raw.githubusercontent.com/konstantin-ki/Physics-heat-capacity/ver2/js/module/ModuleBuzzer.min.js');


exports.connect = function(_opt) {
    return new ClassBuzzer(_opt);
};
