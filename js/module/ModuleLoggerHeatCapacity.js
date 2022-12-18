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
     * @param {*} _owBusPin1    - {OWpin: <Pin>} объект содержащий порт на котором будет работать датчик
     * @param {*} _owBusPin2    - {OWpin: <Pin>} объект содержащий порт на котором будет работать датчик
     * @param {*} _owBusPin3    - {OWpin: <Pin>} объект содержащий порт на котором будет работать датчик
     * @param {*} _btn1 
     * @param {*} _btn2 
     * @param {*} _ledPin 
     * @param {*} _buzPin 
     */
    constructor(_spiPin, _csPin, _owBusPin1, _owBusPin2, _owBusPin3, _btn1, _btn2, _ledPin, _buzPin) {
        this._Btn1 = _btn1; //pin кнопки ассоциированной с экспериментом №1
        this._Btn2 = _btn2; //pin кнопки ассоциированной с экспериментом №2
        this._Led = _ledPin; //pin светодиода сигнализирующий о выполняющимся эксперименте
        this._Buz = _buzPin; //pin пьезоизлучателя (сигнализирует о фазах эксперимента)
        
        // данную конструкцию конструкцию расскоментировать в случае скачивания проекта с гитхаба, в таком случае
        // локальна библиотека будет недоступна
        //this._ClassBaseDS18B20 = require('https://github.com/konstantin-ki/Physics-heat-capacity/blob/main/js/module/ModuleBaseDS18B20.js'); //импортируем прикладной класс ошибок
        
        /* DEBUG>> конструкция на момент написания программы не работает !
        this._ClassBaseDS18B20 = require('ModuleBaseDS18B20'); //подключить класс (!) ClassBaseSPIBus
        */

        this._SensTemp1 = new ClassBaseDS18B20(_owBusPin1, this.TEMP_SENS_RESOLUTION);
        this._SensTemp2 = new ClassBaseDS18B20(_owBusPin2, this.TEMP_SENS_RESOLUTION);
        /* DEBUG>> конструкция на момент написания программы не работает !
        this._ClassBaseSDcard = require('ModuleBaseSDcard'); //подключить класс (!) ClassBaseSDcard        
        */
        this._IdTimerPhase1 = undefined; //указатель на таймер функции эксперимента №1
        this._IdTimerPhase1 = undefined; //указатель на таймер функции эксперимента №2
        this._IdTimerPhase3 = undefined; //указатель на таймер функции эксперимента №2

        this._CountCoolWater = 0; //счетчик количества измерений температуры холодной воды
        this._CountHotWater = 0; //счетчик количества измерений температуры горячей воды
        this._CountWriteFile = 0; //линейно-нарастающий счетчик записей в файле

        this._TempCool = 25; //поле хранит температуру "холодной" воды
        this._TempTermos1 = [];
        //this._TempTermos1Prev = 0; //поле хранит температуру термоса 1 предыдущего измерения
        //this._TempTermos1Curr = 70; //поле хранит температуру термоса 1 текущего измерения
        //this._TempTermos2Prev = 0; //поле хранит температуру термоса 2 предыдущего измерения
        //this._TempTermos2Curr = 70; //поле хранит температуру термоса 2 текущего измерения

        this._HandlerFile = undefined; //указатель на файл с данными измерениями

        try {
            //console.log(`DEBUG>> new ClassBaseSDcard(...)`);
            /* DEBUG>> конструкция на момент написания программы не работает !
            this._SD = new _ClassBaseSDcard(_spiPin, _csPin); //создаем объект SD карты
            */
           this._SD = new ClassBaseSDcard(_spiPin, _csPin); //создаем объект SD карты
        } catch (e) {
            console.log(`ERROR>> ${e.Code}, ${e.message}`);
        }
        
    }
    /*******************************************CONST********************************************/
    /** @const @type {number} */
    get TEMP_SENS_RESOLUTION() { return 12; } //разрешения в bit датчика DS18B20
    /** @const @type {number} */
    get TIME_PERIOD_COOL_WATER() { return 500; } //период (ms) замера температуры "холодной" воды
    /** @const @type {number} */
    get COUNT_MEASUREMENTS_COOL_WATER() { return 5; }  //количество замеров холодной воды
    /** @const @type {number} */
    get TIME_PERIOD_HOT_WATER() { return 5000; }  //период (ms) замера температуры "горячей" воды
    /** @const @type {number} */
    get HEAT_LOSS_CONST_THERMOS_1() { return 0.00089; } //константа тепловых потерь первого термоса
    /** @const @type {number} */
    get HEAT_LOSS_CONST_THERMOS_2() { return 0.00046; } //константа тепловых потерь второго термоса
    /** @const @type {string} */
    get NAME_DATA_FILE() { return 'data.csv'; } //константа тепловых потерь второго термоса
    /*******************************************END CONST******************************************/

    /**
     * 
     */
    MeasurementCoolWater() {
        this._TempCool = this._SensTemp1.Temp; //считать температуру "холодной" воды
            console.log(`DEBUG>> TEMP: ${this._TempCool.toFixed(2)}`);
        
        ++this._CountCoolWater; //инкремент количества измерений температуры
        //отбрасываем первое измерение
        if(this._CountCoolWater>1){
            ++this._CountWriteFile; //индексировать счетчик записей в файле
            
            //console.log(`DEBUG>> E.openFile(data.csv, a)`);
            this._HandlerFile = E.openFile(this.NAME_DATA_FILE, 'a'); //открыть файл в режиме добавления 
            
            //подготовить строку с данными для записи в файл
            let data_str =  this._CountWriteFile + ';' +
                            'Phase2' + ';' +
                            'Cool----' + ';' +
                            Math.ceil(getTime()) + ';' +
                            this._TempCool.toFixed(2) + ';' +
                            '\r\n';
            this._HandlerFile.write(data_str); //записать результаты измерения в файл
                this._HandlerFile.close(); //закрыть файл
                    this._HandlerFile = undefined; //сбросить указатель на файл

            if (this._CountCoolWater == this.COUNT_MEASUREMENTS_COOL_WATER) {
                /* завершить измерение холодной воды */
                clearInterval(this._IdTimerPhase2);
                    this._CountCoolWater = 0; //обнулить счетчик количества измерений "холодной" воды
                        this._SD.DisconnectSD(); //размонтировать SD карту
                
                /*-сформировать двойной звуковой сигнал-*/
                let beep_count = 4; //переменная помогает организовать двойной звуковой сигнал
                let beep_flag = true;
                analogWrite(this._Buz, 0.5, { freq : 4000 }); //включить звуковой сигнал
                let beep_func = ()=>{
                    --beep_count;
                    if (beep_count > 0) {
                        if (beep_flag) {
                            digitalWrite(this._Buz, beep_flag); //выключить звук
                        } else {
                            analogWrite(this._Buz, 0.5, {freq: 4000});
                        }
                        beep_flag = !beep_flag;
                        setTimeout(beep_func, 150); //взвести очередное исполнение setTimeout()
                    } 
                };
                setTimeout(beep_func, 150);
            }
        }
    }
    /**
     * 
     */
    MeasurementHotWater() {
        let loss_temperature = null; //текущая скорость изменения температуры
        let loss_delta = null; //разница между текущей скоростью изменения температуры и константой тепловых потерь
        
        /* отбрасываем первое измерение */
        if (this._CountHotWater < 1) {
            let tmp = this._SensTemp2.Temp; //произвести "пустое" считывание
                ++this._CountHotWater; //инкремент количества измерений температуры
            return 0; //досрочный выход
        }
        this._TempTermos1.push(this._SensTemp2.Temp); //считать и записать температуру в массив значений
            ++this._CountHotWater; //инкремент количества измерений температуры
                console.log(`DEBUG>> ________N${this._CountHotWater} TEMP: ${this._TempTermos1[this._TempTermos1.length-1].toFixed(2)}`);
        /* Подготовить строку с данными для записи в файл */
        let data_str =  this._CountWriteFile + ';' +
                            'Phase3' + ';' +
                            'Thermos1' + ';' +
                            Math.ceil(getTime()) + ';' +
                            this._TempTermos1[this._TempTermos1.length-1].toFixed(2) + ';' +
                            loss_temperature + ';' +
                            loss_delta + ';' +
                            '\r\n';
        this._HandlerFile.write(data_str); //записать результаты измерения в файл
            ++this._CountWriteFile; //индексировать счетчик записей в файле
        /*
            Проверка условия завершения эксперимента. Первым шагом выполняется проверка количества
            измерений выполненных на текущий момент. Если 61 и более то выполняются следующие шаги.
            Обоснование числа 61: при исследовании величины тепловых потерь термосов, было установлено
            что измерение величины dT/dt, надежно определяется примерно на интервале времени 5 минут
            и более. На момент проведения первых экспериментов был установлен "малый" интервал
            измерений равный 5 секунд, что позволяет оперативно отслеживать и фиксировать температуру
            но не позволяет "почуствовать" изменения dT/dt между измерениями, то был введен "большой"
            интервал измерений равный 5 мин или 61 измеерние, т.к. интервал между первым и последним
            измерениям в таком случае будет равен  N-1 * Tмал (61-1 * 5сек = 300 сек = 5 мин)
        */
        if( this._TempTermos1.length > 120 ){
            if( this._TempTermos1.length == 121 ){
                /* Cформировать одинарный звуковой сигнал */
                analogWrite(this._Buz, 0.5, {freq: 4000}); //включить звуковой сигнал
                    setTimeout(()=>{ digitalWrite(this._Buz, 0); }, 200); //выключить звуковой сигнал
            }
            /*
                Вычисляем разницу между константой тепловых потерь для данного термоса и текущей
                скоростью падения температуры
            */
            let length = this._TempTermos1.length; //текущая длина массива температур воды термоса
                loss_temperature = (this._TempTermos1[length-121] - this._TempTermos1[length-1])/(this.TIME_PERIOD_HOT_WATER*120);
                loss_delta = Math.abs(loss_temperature) - this.HEAT_LOSS_CONST_THERMOS_2;
                    console.log(`DEBUG>> ______TEMP LOSS: ${loss_temperature}`);
                    console.log(`DEBUG>> DELTA TEMP LOSS: ${loss_delta}`);
            /*
                Сравнить текущее значение dT/dt с 5% значением от константы тепловых потерь
                данного термоса и если оно меньше завершить эксперимент
            */
            if (loss_delta <= this.HEAT_LOSS_CONST_THERMOS_2*0.05) {                
                clearInterval(this._IdTimerPhase3); //остановить циклическое измерение температуры
                    this._CountHotWater = 0; //обнулить счетчик количества измерений воды в термосе
                        this._TempTermos1.length = 0; //обнулить массив измеренных значений
                
                this._HandlerFile.close(); //закрыть файл
                    this._HandlerFile = undefined; //сбросить указатель на файл
                        this._SD.DisconnectSD(); //размонтировать SD карту
                
                /*-сформировать двойной звуковой сигнал сигнализирующий о завершении эксперимента-*/
                let beep_count = 4; //переменная помогает организовать двойной звуковой сигнал
                let beep_flag = true;
                analogWrite(this._Buz, 0.5, { freq : 4000 }); //включить звуковой сигнал
                let beep_func = ()=>{
                    --beep_count;
                    if (beep_count > 0) {
                        if (beep_flag) {
                            digitalWrite(this._Buz, beep_flag); //выключить звук
                        } else {
                        analogWrite(this._Buz, 0.5, {freq: 4000});
                        }
                        beep_flag = !beep_flag;
                        setTimeout(beep_func, 150); //взвести очередное исполнение setTimeout()
                    } 
                };
                setTimeout(beep_func, 150);
            }
        }
    }
    /**
     * 
     */
    MonitorPhase2Start(){
        setWatch(this.Phase2.bind(this), this._Btn1, {
            edge: "falling",
            debounce: 50,
            repeat: true
        }); //срабатывает по отпусканию кнопки
    }
    /**
     * 
     */
    MonitorPhase2Stop(){
        clearInterval(this._IdTimerPhase2);
        
        if(this._HandlerFile !== undefined){
            this._HandlerFile.close(); //закрыть файл
                this._HandlerFile = undefined; //сбросить указатель на файл
        }
        this._SD.DisconnectSD(); //размонтировать SD карту
    }
    /**
     * 
     */
    MonitorPhase3Start(){
        setWatch(this.Phase3.bind(this), this._Btn2, {
            edge: "falling",
            debounce: 50,
            repeat: true
        }); //срабатывает по отпусканию кнопки
    }
    /**
     * Метод обеспечивает жесткое прерывание выполнение эксперемента фазы 3
     */
    MonitorPhase3Stop(){
        clearInterval(this._IdTimerPhase3);
        
        if(this._HandlerFile !== undefined){
            this._HandlerFile.close(); //закрыть файл
                this._HandlerFile = undefined; //сбросить указатель на файл
        }
        this._SD.DisconnectSD(); //размонтировать SD карту
    }
    /**
     * 
     */
    Phase2() {
        /*--сформировать одинарный звуковой сигнал--*/
        analogWrite(this._Buz, 0.5, {freq: 3000}); //включить звуковой сигнал
            setTimeout(()=>{ digitalWrite(this._Buz, 0); }, 500); //выключить звуковой сигнал
        
            /*-начать измерение "холодной" воды и соответственно температуры анализируемого  тела-*/
        this._IdTimerPhase2 = setInterval(this.MeasurementCoolWater.bind(this), this.TIME_PERIOD_COOL_WATER);
    }
    /**
     * 
     */
    Phase3(){
        /*--сформировать одинарный звуковой сигнал--*/
        analogWrite(this._Buz, 0.5, {freq: 4000}); //включить звуковой сигнал
            setTimeout(()=>{ digitalWrite(this._Buz, 0); }, 500); //выключить звуковой сигнал

        /*-начать измерение "горячей" воды и определения момента теплового баланса-*/
        this._HandlerFile = E.openFile(this.NAME_DATA_FILE, 'a'); //открыть файл в режиме добавления
        
        this._IdTimerPhase3 = setInterval(this.MeasurementHotWater.bind(this), this.TIME_PERIOD_HOT_WATER);
            console.log(`DEBUG>> START Phase3...`);
    }
    /**
     * 
     */
    Run() {
        this.MonitorPhase2Start(); //отслеживать кнопку запуска эксперимента
        this.MonitorPhase3Start(); //отслеживать кнопку запуска эксперимента
    }
}

exports = ClassLoggerHeatCapacity; //экспортируем класс, ВНИМАНИЕ - именно класс а не объект!