/**
 * @class
 * Класс реализует логику эксперимента по измерению теплоемкости тела.
 * Методы класса предоставляют реализацию для каждого этапа эксперимента:
 *  1 - определения постоянной потерь термоса1 и термоса2;
 *  2 - измерения температуры воды в термосах (место хранения исследуемых тел);
 *  3 - определение температуры "горячей" воды, перед погружением тела
 *  4 - измерение температуры и определение момента установления теплового баланса
 * 
 * Класс является прикладным (!), специализированным в рамках проекта. Реализация класса
 * опирается на наличие глобальных объектов созданных в секции RUNTIME, таких как 
 * SPIbus, OWbus, SDcard (глобальные контейнеры шин SPI и OW, объект для работы с SD картой)
 */
class ClassLoggerHeatCapacity {

    /**
     * @constructor
     * @param {*} _spiPin 
     * @param {*} _csPin 
     * @param {*} _owBusPin1 
     * @param {*} _owBusPin2 
     * @param {*} _owBusPin3 
     * @param {*} _btn1 
     * @param {*} _btn2 
     * @param {*} _ledPin 
     * @param {*} _buzPin 
     */
    constructor(_spiPin, _csPin, _owBusPin1, _owBusPin2, _owBusPin3, _btn1, _btn2, _ledPin, _buzPin) {

        this._CS = _csPin; //pin сигнала CS карты SD
        this._HandlerOWbus1 = new OneWire(_owBusPin1); //объект шины onewire первого термодатчика
        this._HandlerOWbus2 = new OneWire(_owBusPin2); //объект шины onewire второго термодатчика
        this._HandlerOWbus3 = new OneWire(_owBusPin3); //объект шины onewire третьего термодатчика
        this._Btn1 = _btn1; //pin кнопки ассоциированной с экспериментом №1
        this._Btn2 = _btn2; //pin кнопки ассоциированной с экспериментом №2
        this._Led = _ledPin; //pin светодиода сигнализирующий о выполняющимся эксперименте
        this._Buz = _buzPin; //pin пьезоизлучателя (сигнализирует о фазах эксперимента)

        /* данную конструкцию конструкцию расскоментировать в случае скачивания проекта с гитхаба, в таком случае
           локальна библиотека будет недоступна*/
        //this.ClassSensTemp = require('https://github.com/konstantin-ki/Physics-heat-capacity/blob/main/js/module/ModuleBaseDS18B20.js'); //импортируем прикладной класс ошибок
        this._ClassSensTemp = require('ModuleBaseDS18B20'); //подключить класс (!) ClassBaseSPIBus
        this._SensTemp1 = new ClassBaseDS18B20(_HandlerOWbus1,);

        this._ClassBaseSDcard = require('ModuleBaseSDcard'); //подключить класс (!) ClassBaseSDcard        

        this._IdTimerPhase1 = undefined; //указатель на таймер функции эксперимента №1
        this._IdTimerPhase1 = undefined; //указатель на таймер функции эксперимента №2
        this._IdTimerPhase3 = undefined; //указатель на таймер функции эксперимента №2

        this._CountCoolWater = 0; //счетчик количества измерений температуры холодной воды
        this._CountHotWater = 0; //счетчик количества измерений температуры горячей воды
        this._CountWriteFile = 0; //линейно-нарастающий счетчик записей в файле

        this._TempCool = 25; //поле хранит температуру "холодной" воды
        this._TempTermos1Prev = 0; //поле хранит температуру термоса 1 предыдущего измерения
        this._TempTermos1Curr = 70; //поле хранит температуру термоса 1 текущего измерения
        this._TempTermos2Prev = 0; //поле хранит температуру термоса 2 предыдущего измерения
        this._TempTermos2Curr = 70; //поле хранит температуру термоса 2 текущего измерения

        try {
            console.log(`DEBUG>> new ClassBaseSDcard(...)`);
            this._SD = new _ClassBaseSDcard(_spiPin, _csPin); //создаем объект SD карты
        } catch (e) {
            console.log(`ERROR>> ${e.Code}, ${e.message}`);
        }
        this._HandlerFile = undefined; //указатель на файл с данными измерениями
    }
    /*******************************************CONST********************************************/
    /** @const @type {number} */
    get TEMP_SENS_RESOLUTION() { return 12; } //разрешения в bit датчика DS18B20
    /** @const @type {number} */
    get TIME_PERIOD_COOL_WATER() { return 1000; } //период (ms) замера температуры "холодной" воды
    /** @const @type {number} */
    get COUNT_MEASUREMENTS_COOL_WATER() { return 11; }  //количество замеров холодной воды
    /** @const @type {number} */
    get TIME_PERIOD_HOT_WATER() { return 5000; }  //период (ms) замера температуры "горячей" воды
    /** @const @type {number} */
    get HEAT_LOSS_CONST_THERMOS_1() { return 0.00089; } //константа тепловых потерь первого термоса
    /** @const @type {number} */
    get HEAT_LOSS_CONST_THERMOS_2() { return 0.00046; } //константа тепловых потерь второго термоса
    /** @const @type {string} */
    get NAME_DATA_FILE() { return 'data.csv'; } //константа тепловых потерь второго термоса
    /*******************************************END CONST********************************************/

    /**
     * 
     */
    MeasurementCoolWater() {
        PixelNRFmanagement.SleepNRF(); //отключаем BLE через вызов SleepNRF() глобального объекта PixelNRFmanagement
            this._TempCool = this._HandlerOWbus1.Temp; //считать температуру "холодной" воды
        PixelNRFmanagement.WakeNRF(); //включаем BLE через вызов WakeNRF() глобального объекта PixelNRFmanagement
        
        ++this._CountCoolWater; //инкремент количества измерений температуры
        //отбрасываем первое измерение
        if(this._CountCoolWater>1){
            ++this._CountWriteFile; //индексировать счетчик записей в файле
            
            console.log(`DEBUG>> E.openFile(data.csv, a)`);
            this._HandlerFile = E.openFile(this.NAME_DATA_FILE, 'a'); //открыть файл в режиме добавления 
            
            //подготовить строку с данными для записи в файл
            let data_str =  this._CountWriteFile + ';' +
                            'Phase2' + ';' +
                            'Cool----' + ';' +
                            Math.trunc(getTime()) + ';' +
                            this._TempCool.toFixed(2) + ';'
            _HandlerFile.write(data_str); //записать результаты измерения в файл
            this._HandlerFile.close(); //закрыть файл

            if (this._CountCoolWater == this.COUNT_MEASUREMENTS_COOL_WATER) {
                /* завершить измерение холодной воды */
                clearInterval(this._IdTimerPhase2);
                this._CountCoolWater = 0; //обнулить счетчик количества измерений "холодной" воды
                
                /*-сформировать двойной звуковой сигнал-*/
                let beep_count = 4; //переменная помогает организовать двойной звуковой сигнал
                let beep_flag = true;
                analogWrite(this._Buz, 0.5, { freq : 4000 }); //включить звуковой сигнал
                let beep_func = ()=>{
                    --beep_count;
                    if (beep_count > 0) {
                        beep_flag = !beep_flag;
                        if (beep_flag) {
                            digitalWrite(this._Buz, beep_flag); //выключить звук
                        } else {
                            analogWrite(this._Buz, 0.5, {freq: 4000});
                        }
                        setTimeout(f, 200); //взвести очередное исполнение setTimeout()
                    } 
                }
                setTimeout(beep_func, 200);
            }
        }
    }
    /**
     * 
     */
    MeasurementHotWater() {
        PixelNRFmanagement.SleepNRF(); //отключаем BLE через вызов SleepNRF() глобального объекта PixelNRFmanagement
            this._TempTermos1Prev = this._TempTermos1Curr; //обновить значение предыдущего значения
            this._TempTermos1Curr = this._HandlerOWbus2.Temp; //считать температуру воды в термосе 1
             
        PixelNRFmanagement.WakeNRF(); //включаем BLE через вызов WakeNRF() глобального объекта PixelNRFmanagement

        ++this._CountHotWater; //инкремент количества измерений температуры
        //отбрасываем первые три измерения, т.к. первое недействительное, и нужно два сохранить
        if (this._CountHotWater > 3) {
        ++this._CountWriteFile; //индексировать счетчик записей в файле

        console.log(`DEBUG>> E.openFile(data.csv, a)`);
        this._HandlerFile = E.openFile(this.NAME_DATA_FILE, 'a'); //открыть файл в режиме добавления

        //подготовить строку с данными для записи в файл
        let data_str =  this._CountWriteFile + ';' +
                        'Phase3' + ';' +
                        'Thermos1' + ';' +
                        Math.trunc(getTime()) + ';' +
                        this._TempHotTermos1.toFixed(2) + ';'
                        _HandlerFile.write(data_str); //записать результаты измерения в файл
        _HandlerFile.write(data_str); //записать результаты измерения в файл
        this._HandlerFile.close(); //закрыть файл
        
        /*-вычисляем разницу между константой тепловых потерь для данного термоса и текущей
           скоростью падения температуры и сравниваем с 5% значением от константы тепловых потерь
           данного термоса-*/
        let temp_loss = (this._TempTermos1Prev - this._TempTermos1)/this.TIME_PERIOD_HOT_WATER;
        let delta_temp_loss = Math.abs(temp_loss - this.HEAT_LOSS_CONST_THERMOS_2);
        console.log(`DEBUG>> current loss = ${temp_loss}`);
        if (delta_temp_loss <= this.HEAT_LOSS_CONST_THERMOS_2*0.05) {
            /* завершить измерение температуры воды в термосе */
            clearInterval(this._IdTimerPhase3);
            this._CountHotWater = 0; //обнулить счетчик количества измерений воды в термосе

            /*-сформировать двойной звуковой сигнал-*/
            let beep_count = 4; //переменная помогает организовать двойной звуковой сигнал
            let beep_flag = true;
            analogWrite(this._Buz, 0.5, {
                freq: 4000
            }); //включить звуковой сигнал
            let beep_func = () => {
                --beep_count;
                if (beep_count > 0) {
                    if (beep_flag) {
                        digitalWrite(this._Buz, beep_flag); //выключить звук
                    } else {
                        analogWrite(this._Buz, 0.5, { freq: 4000  });
                    }
                    beep_flag = !beep_flag;
                    setTimeout(beep_func, 150); //взвести очередное исполнение setTimeout()
                }
            }
            setTimeout(beep_func, 150);
        }
    }
    }
    /**
     * 
     */
    MonitorExp1Start(){

    }
    /**
     * 
     */
    MonitorExp1Stop(){

    }
    /**
     * 
     */
    MonitorExp2Start(){

    }
    /**
     * 
     */
    MonitorExp2Stop(){

    }
    /**
     * 
     */
    Phase1(){
    }
    /**
     * 
     */
    Phase2() {
        /*-начать измерение "холодной" воды и соответственно температуры анализируемого  тела-*/
        this._IdTimerPhase2 = setInterval(this.MeasurementsCoolWater.bind(this), this.TIME_PERIOD_COOL_WATER);
    }
    /**
     * 
     */
    Phase3(){
        /*-начать измерение "горячей" воды и определения момента теплового баланса-*/
        this._IdTimerPhase3 = setInterval(this.MeasurementsCoolWater.bind(this), this.TIME_PERIOD_HOT_WATER);
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
}

exports = ClassLoggerHeatCapacity; //экспортируем класс, ВНИМАНИЕ - именно класс а не объект!