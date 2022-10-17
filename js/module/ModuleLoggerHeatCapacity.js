/**
 * Класс <ClassLogger> является классом верхнего уровня по ерализации логгера температуры
 * и сопуствующих параметров.
 * <ClassLogger> - наследует от класса <ClassBaseSDcard>
 * В классе определены важнейшие параметры протоколирования температуры и других параметров
 * на SD карте.
 */
class ClassLogger extends ClassBaseSDcard {
    constructor(_spiBus, _csPin, _butInd, _ledInd, _sensTemp, _cycleLogger) {
        super(_spiBus, _csPin, _butInd, _ledInd);

        this.SensTemp = _sensTemp; //присвоить объект предоставляющий данные о температуре
        this.FS = require("fs"); //подключить библиотеку работы с файлами
        this.IdTimerLogger = undefined; //указатель на таймер периодической ф-и записи данных
        this.CycleTimeLogger = _cycleLogger || 1000; //время периода записи данных на SD карту
    }

    /**
     * 
     */
    Logger() {
        if (this.FlagStatusSD) {
            let date = new Date(); //получить объект хранящий timestamp
            let csv_str = date.getFullYear().toString() +
                '.' +
                date.getMonth().toString() +
                '.' +
                date.getDate().toString() +
                ';' +
                date.getHours() +
                ':' +
                date.getMinutes() +
                ':' +
                date.getSeconds() +
                ';' +
                this.SensTemp.CurTemp.toFixed(2) +
                ';' +
                '\n'; //получить полный год
            this.FS.appendFileSync('Data.csv', csv_str);
        } else {
            clearTimeout(this.IdTimerLogger); //прекратить запись данных т.к. SD карта размонтирована
        }
    }
    /**
     * 
     */
    LoggerCycleBind() {
        this.IdTimerLogger = setInterval(this.Logger.bind(this), this.CycleTimeLogger); //запустить циклическую запись данных на SD карту

    }
}