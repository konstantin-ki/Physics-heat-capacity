class ClassAppError extends Error {
    constructor(_message, _code) {
        this.message = _message;
        this.name = "ClassAppError"; 
        this.Code = _code || 0; 
    }
}

class ClassBaseSPIBus {
    /**
     * @constructor
     */
    constructor() {
        

        this.SPIbus = {}; 
        this.Pattern = 'SPI'; 
        this.IndexBus = 10; 

        
        
        this.SPIbus.SPI1= {IDbus: SPI1, Used: false}; 

        
        if (this.Instance) {
            return this.Instance;
        } else {
            ClassBaseSPIBus.prototype.Instance = this;
        }
    }

    static get ERROR_CODE_ARG_MOSI_MISO_SCK_NOT_DEFINED() { return 10; } 
    /**
     * Константа ERROR_MSG_ARG_MOSI_MISO_SCK_NOT_DEFINED определяет СООБЩЕНИЕ ошибки,
     * которая может      * произойти при вызове метода AddBus в том случае если не был
     * передан один или более портов MOSI, MISO, SCK необходимых для создания SPI шины
     */
    static get ERROR_MSG_ARG_MOSI_MISO_SCK_NOT_DEFINED() { return 'Error -> The MOSI, MISO, SCK port is not defined'; }
    /**
     * Константа ERROR_CODE_SPI_PIN_NOT_EXISTING определяет КОД ошибки, которая может
     * произойти в случае если для создания SPI шины были переданы не существующие порты
     * микроконтроллера, или занятые другими объектами
     */
    static get ERROR_CODE_SPI_PIN_NOT_EXISTING() { return 20;}
    /**
     * Константа ERROR_MSG_SPI_PIN_NOT_EXISTING определяет СООБЩЕНИЕ ошибки, которая может
     * произойти в случае если для создания SPI шины были переданы не существующие порты
     * микроконтроллера, или занятые другими объектами
     */
    static get ERROR_MSG_SPI_PIN_NOT_EXISTING() { return 'Error -> The SPI pin not existing'; }
    /**
     * Метод AddBus создает объект экземпляр класса SPI, как soft реализацию SPI шины.
     * Методу передается в качестве аргумента объект с параметрами создаваемой шины.
     * @method
     * @param {ObjectSPIBusParam}   _opt        1 - объект с параметрами шины SPI
     * @returns {Object}            _retVal     1 - возвращаемый объект вида:
     *                                          { NameBus: bus_name, 
     *                                            IDbus:   this.SPIbus.bus_name.IDbus 
     *                                          }
     */
    AddBus(_opt) {

        if ((typeof (_opt.mosi) === undefined) || (typeof (_opt.miso) === undefined) || (typeof (_opt.sck) === undefined)) {

           throw new ClassAppError(ClassBaseSPIBus.ERROR_MSG_ARG_MOSI_MISO_SCK_NOT_DEFINED,
                                     ClassBaseSPIBus.ERROR_CODE_ARG_MOSI_MISO_SCK_NOT_DEFINED);
            
        }

        if (!(_opt.mosi instanceof Pin) || !(_opt.miso instanceof Pin) || !(_opt.sck instanceof Pin)){

           throw new ClassAppError(ClassBaseSPIBus.ERROR_MSG_SPI_PIN_NOT_EXISTING,
                                   ClassBaseSPIBus.ERROR_CODE_SPI_PIN_NOT_EXISTING);
        }

        /*все необходимые для создания шины параметры переданы -> создать и инициализировать новую шину*/
        let bus_name = this.Pattern + this.IndexBus; 
        
        this.SPIbus.bus_name = {
            IDbus: new SPI(), 
            Used: true 
        };
        this.SPIbus.bus_name.IDbus.setup(_opt); 
        
        ++this.IndexBus; 
        
        return {
                NameBus: bus_name, 
                IDbus:   this.SPIbus.bus_name.IDbus 
            };
    }
}

class ClassBaseOneWire {
/**
 * @constructor
 */
    constructor(){
        this.OWbus = {}; //контейнер объектов-шин OW, пример записи OWbus поля OWbus.OW1 ={IDbus: new OneWire(), Used: true};
        this.Pattern = 'OW'; //базовая часть всех ключей объектов-шин OW, полное название получается конкатенацией с текущим индексом
        this.IndexBus = 1; //начальный индекс OW шин, полный индекс будет вида OW11, OW12, OW13 и т.д.
        
         //реализация паттерна синглтон
        if (this.Instance) {
            return this.Instance;
        } else {
            ClassBaseOneWire.prototype.Instance = this;
        }
    }
    /**
     * @const
     * @type {number}
     * Константа ERROR_CODE_OW_PIN_NOT_EXISTING определяет КОД ошибки, которая может
     * произойти в случае если для создания OW шины были переданы не существующие порты
     * или не были переданы вовсе.
     * микроконтроллера, или занятые другими объектами
     */
    static get ERROR_CODE_OW_PIN_NOT_EXISTING() { return 20;}
    /**
     * @const
     * @type {string}
     * Константа ERROR_MSG_OW_PIN_NOT_EXISTING определяет СООБЩЕНИЕ ошибки, которая может
     * произойти в случае если для создания OW шины были переданы не существующие порты
     * микроконтроллера, или занятые другими объектами
     */
    static get ERROR_MSG_OW_PIN_NOT_EXISTING() { return 'Error -> The OW pin not existing'; }
   /**
    * Метод AddBus создает объект экземпляр класса OW, как soft реализацию OW шины.
    * Методу передается в качестве аргумента объект с параметрами создаваемой шины.
    * @method
    * @param {ObjectOWBusParam}   _opt        1 - объект с полем OWpin - объект Pin шины OW
    * @returns {Object}           _retVal     1 - возвращаемый объект вида:
    *                                          { NameBus: bus_name, //имя созданной шины
    *                                            IDbus:   this.OWbus.bus_name.IDbus //объект шины OW
    *                                          }
    */
    AddBus( _opt){

        if ( !(_opt.OWpin instanceof Pin) ) {
            throw new ClassAppError(ClassBaseOneWire.ERROR_MSG_OW_PIN_NOT_EXISTING,
                                    ClassBaseOneWire.ERROR_CODE_OW_PIN_NOT_EXISTING);
        }
        /*все необходимые для создания шины параметры переданы -> создать и инициализировать новую шину*/
        let bus_name = this.Pattern + this.IndexBus; //полное имя ключа текущей шины
        
        this.OWbus.bus_name = {
            IDbus: new OneWire(_opt.OWpin), //сгенерировать шину
            Used: true //индикатор использования шины в true
        };        
        ++this.IndexBus; //увеличить индекс шины
        
        return {
                NameBus: bus_name, //имя созданной шины
                IDbus:   this.OWbus.bus_name.IDbus //объект шина OW
            };
    }
}

class ClassBaseSDcard {
    /**
     * @constructor
     * @param {ObjectSPIBusParam}   _spiOpt   1 - объект содержащий Pin-ы шины SPI, объект типа ObjectSPIBusParam, см. модуль ModuleBaseSPI
     * @param {Object}              _csPin    2 - Pin отвечающий за сигнал CS карты  SD
     */
    constructor(_spiOpt, _csPin) {

        if ( typeof(_csPin) === undefined ) {
            throw new ClassAppError(ClassBaseSDcard.ERROR_MSG_ARG_NOT_DEFINED + 'Arg error: _csPin',
                                    ClassBaseSDcard.ERROR_CODE_ARG_NOT_DEFINED);
        }

        this.SD = { IDbus: {}, CSpin: {} }; 
        
        /*аргументы относящиеся к SPI шине проверяются на валидность в модуле ClassBaseSPIBus*/
        try{
            this.SD.IDbus = SPIbus.AddBus(_spiOpt).IDbus; 
        } catch(e){
            console.log(e.message); 
        }
        this.SD.CSpin = _csPin; 

        /*TRANSFER ВНИМАНИЕ: код подлежит переносу в класс ClassMidleSDcard
        this.StatusButton = _butInd; 
        this.StatusInd = _ledPin; 
        */

        this._FlagStatusSD = false; 

        
        this.ConnectSD(); 
        /*TRANSFER ВНИМАНИЕ: код подлежит переносу в класс ClassMidleSDcard
        this.CompleteWorkSD(); 
        */
    }
    /***********************************************КОНСТАНТЫ КЛАССА***********************************************/
    /**
     * Константа класса ERROR_CODE_ARG_NOT_DEFINED определяет КОД ошибки, которая может
     * произойти если при передачи в конструктор не корректных аргументов
     */
    static get ERROR_CODE_ARG_NOT_DEFINED() { return 10; }
    /**
     * Константа класса ERROR_MSG_ARG_NOT_DEFINED определяет СООБЩЕНИЕ ошибки, которая может
     * произойти если при передачи в конструктор не корректных аргументов
     */
    static get ERROR_MSG_ARG_NOT_DEFINED() { return 'Error -> invalid arguments the constructor'; }
    /**
     * Константа класса ERROR_CODE_SD_UNMOUNTED определяет КОД ошибки, которая
     * возникает при попытке вызвать операцию чтения/записи при размонтированной карте
     */
    static get ERROR_CODE_SD_UNMOUNTED() { return 11; }
    /**
     * Константа класса ERROR_MSG_SD_UNMOUNTED определяет СООБЩЕНИЕ ошибки, которая
     * возникает при попытке вызвать операцию чтения/записи при размонтированной карте
     */
    static get ERROR_MSG_SD_UNMOUNTED() { return 'Error -> accessing the unmounted SD'; }
    /**
     * 
     */
    get FlagStatusSD() {
        return this._FlagStatusSD;
    }
    /**
     * 
     */
    set FlagStatusSD(_flag) {
        this._FlagStatusSD = _flag;
    }
    /***
     * Метод ConnectSD "монтирует" карту SD в систему
     */
    ConnectSD() {
        E.connectSDCard(this.SD.IDbus, this.SD.CSpin); 
            this.FlagStatusSD = true; 
    }
    /**
     * Метод DisconnectSD "размонтирует" карту SD, готовя ее к извлечению
     */
    DisconnectSD() {
        E.unmountSD();
            this.FlagStatusSD = false; 
        /*TRANSFER ВНИМАНИЕ: код подлежит переносу в класс ClassMidleSDcard
        digitalWrite(this.StatusInd, 1); 
        TRANSFER*/

        
        
    }
    /*TRANSFER ВНИМАНИЕ: метод CompleteWorkSD ПОЛНОСТЬЮ подлежит переносу в класс ClassMidleSDcard
    /**
     * Метод CompleteWorkSD позволяет размонтировать карту в ручном режиме, нажав кнопку.
     * Для работы необходимо передать порт на котором работает кнопка
     
    CompleteWorkSD() {
        
        setWatch(this.DisconnectSD.bind(this), this.StatusButton, {
            edge: "falling",
            debounce: 50,
            repeat: true
        });
    }*/
    
    /**
     * Метод <ViewListFiles> перенести в класс ClassBaseSDcard
     */
    ViewListFiles() {
        if (this.FlagStatusSD) {
            return require('fs').readdirSync(); 
        } else {
            
            throw new ClassAppError(ClassBaseSDcard.ERROR_MSG_SD_UNMOUNTED,
                                        ClassBaseSDcard.ERROR_CODE_SD_UNMOUNTED);
        }
    }
}

class ClassBaseDS18B20 {
    /**
     * @constructor
     * @param {Object} _opt              1 - объект {OWpin: <Pin class>} порт на котором "сидит" термодатчик 
     * @param {number} [_sensRes]        2 - разрешение датчика в битах, может принимать значения  9...12
     */
    constructor(_opt, _sensRes) {

        this.OW = OWbus.AddBus(_opt).IDbus; //получить шину OneWire ВНИМАНИЕ:  OWbus - глобальный объект (!), должен быть создан в секции RUNTIME
        this.DS18B20 = undefined; //это поле хранит экземпляр драйвера датчика
        this.Resolution = _sensRes || 10; //задать разрешение датчика по температуре, default 10 bit
        this.FlagRunInit = false; //флаг инициализации датчика температуры -  успешно/не успешно
        this._FlagFinalInit = false; //флаг окончания процедуры инициализации
        this.TimeCycleReInit = 20; //время в ms повторной инициализации датчика        
        this.IdTimerTemp = undefined; //id таймера на считывание температуры
        this._Temp = 0; //хранит текущую температуру полученную от датчика

        this.ReadTempBind = this.ReadTemp.bind(this); //Bind версия метода ReadTemp;

        this.InitDS18B20(); //инициализировать датчик
    }
    /**
     * Статическая константа ERROR_CODE_INIT_CRASH_DS18B20 определяет КОД ошибки, которая может
     * произойти в случае если все попытки инициализации датчика завершились неудачей.
     * @const
     * @type {number}
     */
    static get ERROR_CODE_INIT_CRASH_DS18B20() { return 30;}
    /**
     * @const
     * @type {string}
     * Статическая константа ERROR_MSG_INIT_CRASH_DS18B20 определяет СООБЩЕНИЕ ошибки, которая может
     * произойти в случае если все попытки инициализации датчика завершились неудачей.
     */
    static get ERROR_MSG_INIT_CRASH_DS18B20() { return 'Error -> DS18B20 init crash !'; }
    /**
     * @const
     * @type {number}
     * Константа класса, равная максимальному количеству попыток инициализации датчика
     */
    get COUNT_INIT_MAX() { return 20; }
    /**
     * @method
     * Геттер возвращает флаг, характеризующий завершение/работу процедуры инициализации датчика
     * @returns {boolean}
     */
    get FlagFinalInit() { return this._FlagFinalInit; }
    /**
     * Метод устанавливает флаг, характеризующий завершение / работу процедуры инициализации датчика
     * @method
     * @param {boolean}     1 - булевое значение флага
     */
    set FlagFinalInit(_flag) { this._FlagFinalInit = _flag; }
    /**
     * @method
     * Геттер возвращает значение текущей температуры. Имеет побочный эффект, заключающийся
     * в вызове метода ReadTemp который производит считывание температуры с датчика и присваивает
     * ее полю _Temp, через сеттер, который (!) имеет побочный эффект, в виде анализа поступающих
     * значений (см. описание сеттера).
     * Это главный метод класса, именно через него должны получать значения температуры другие 
     * объекты программы.
     * @returns {number}
     */
    get Temp() {
        PixelNRFmanagement.SleepNRF(); //отключаем BLE через вызов SleepNRF() глобального объекта PixelNRFmanagement
            this.Temp = this.ReadTemp(); //обновить температуру через СЕТТЕР (!)
        PixelNRFmanagement.WakeNRF(); //включаем BLE через вызов WakeNRF() глобального объекта PixelNRFmanagement  
        
        return this._Temp; //вернуть текущую температуру
    }
    /**
     * @method
     * Метод устанавливает значение поля, хранящего значение последней измеренной температуры
     */
    set Temp(_temp) {
        this._Temp = (_temp === null) ? this._Temp : _temp; //обработать считанное значение температуры и записать в поле
    }
    /**
     * 
     * @returns {number}
     */
    ReadTemp() {
        return this.DS18B20.getTemp(); //запросить с датчика текущую температуру
    }
    /**
     * @method
     * Метод Info часть интерфейса класса ClassBaseDS18B20, предназначенный для переопределения в
     * классах потомках. Назначение метода - информировать пользователя о ходе процесса инициализации
     * датчика. Решение о том как это делать должно быть реализовано в классах потомках.
     * В данном классе метод ничего не делает.
     * @param {Object}   _opt        1 - объект с произвольными параметрами
     */
    Info(_opt){
        console.log(`INFO>> Stage: ${_opt.Stage}, Error: ${_opt.Error}`);
    }

    InitDS18B20() {

        PixelNRFmanagement.SleepNRF(); //отключаем BLE через вызов SleepNRF() глобального объекта PixelNRFmanagement

        const init_ds18b20 = ()=>{
            // проверяем создание статической переменной функции
            if ( typeof (init_ds18b20.static_counter_init) === 'undefined' ) {
                init_ds18b20.static_counter_init = 0;
            }
            if ( !this.FlagRunInit ) {
                if (init_ds18b20.static_counter_init < this.COUNT_INIT_MAX) {
                    setTimeout(() => {
                        this.Info({Stage: 'run_init', Error: {}});
                        try {
                            this.DS18B20 = require('DS18B20').connect(this.OW); //создать драйвер датчика и инициализировать его
                        } catch (e) {
                            ++init_ds18b20.static_counter_init; //увеличить счетчик попыток
                                this.Info({Stage: 'run_init', Error: e.message}); //если инициализация завершилась неудачей
                            init_ds18b20();
                        }
                        this.FlagRunInit = true; //датчик температуры инициализирован
                            this.FlagFinalInit = true; //установить флаг завершения инициализации
                                this.Info( {Stage: 'final_init', Error: {}} );
                        PixelNRFmanagement.WakeNRF(); //включаем BLE через вызов WakeNRF() глобального объекта PixelNRFmanagement 
                    }, this.TimeCycleReInit);
                } else {
                    this.FlagFinalInit = true; //установить флаг завершения инициализации
                        PixelNRFmanagement.WakeNRF(); //включаем BLE через вызов WakeNRF() глобального объекта PixelNRFmanagement 
                            this.Info({Stage: 'final_init', Error: ClassBaseDS18B20.ERROR_MSG_INIT_CRASH_DS18B20});
                    throw new ClassAppError(ClassBaseDS18B20.ERROR_MSG_INIT_CRASH_DS18B20,
                                            ClassBaseDS18B20.ERROR_CODE_INIT_CRASH_DS18B20); //использованы все попытки инициализировать драйвер датчика
                }
            }
        };
        init_ds18b20(); //запускаем функцию  
    }
}

class ClassPixelNRFmanagement {
    constructor(_buttonPort, _ledPort) {

        this.ButtonNRF = _buttonPort; 
        this.LedModeNRF = _ledPort; 
        this.TimeCyclePulseOFF = 900; 
        this.TimeCyclePulseON = 100; 

        this.FlagWorksNRF = true; 

        
        
    }
    /**
     * Метод отправляет BLE интерфейс в sleep режим и выполняет сопутствующие действия
     */
    SleepNRF() {

        NRF.sleep(); 
        this.FlagWorksNRF = false; 
    }
    /**
     * Метод <WakeNRF> активирует BLE интерфейс и выполняет сопутствующие действия
     */
    WakeNRF() {
        NRF.wake(); 
        this.FlagWorksNRF = true; 
    }
    /*
     *	Метод <OnOffNRF> отправляет в спячку NRF интерфейс или пробуждает его.
     *	Опирается на поле класса <FlagWorksNRF> - определяет режим
     *	NRF sleep (false) или пробуждение wake (true)
     */
    OnOffNRF() {
        if (this.FlagWorksNRF) {

            NRF.sleep(); 
            
        } else {
            NRF.wake(); 
            
        }
        this.FlagWorksNRF = !this.FlagWorksNRF; 
    }
    /*
     *	Мониторинг кнопки управляющей режимом работы NRF/BLE
     */
    MonitorButton() {
        setWatch(this.OnOffNRF.bind(this), this.ButtonNRF, {
            edge: "falling",
            debounce: 50,
            repeat: true
        }); 
    }
    /**
     * Метод управляет сигнализацией состояния статуса BLE интерфейса
     */
    StatusNRFLEDPulse() {
        setTimeout(() => {
            if (this.FlagWorksNRF) {
                analogWrite(this.LedModeNRF, 0.1, {
                    freq: 100
                });
                setTimeout(() => {
                    analogWrite(this.LedModeNRF, 0, {
                        freq: 100
                    });
                    this.StatusNRFLEDPulse();
                }, this.TimeCyclePulseON);
            } else {
                analogWrite(this.LedModeNRF, 0, {
                    freq: 100
                }); 
                this.StatusNRFLEDPulse();
            }
        }, this.TimeCyclePulseOFF);
    }
}

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
    /*******************************************END CONST******************************************/

    /**
     * 
     */
    MeasurementCoolWater() {
        this._TempCool = this._SensTemp1.Temp; //считать температуру "холодной" воды
            console.log(`DEBUG>> Temp cool water: ${this._TempCool.toFixed(2)}`);
        
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
        setWatch(this.Phase2.bind(this), this._Btn2, {
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
        setWatch(this.Phase3.bind(this), this._Btn1, {
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


Terminal.setConsole();
console.log('DERBUG>> START PROGRAMM');
console.log();

let PixelNRFmanagement = new ClassPixelNRFmanagement(); 
let OWbus = new ClassBaseOneWire(); 
let SPIbus = {}; 
try {
    console.log('DEBUG>> new ClassBaseSPIBus(...)');
    SPIbus = new ClassBaseSPIBus();
} catch (e) {
    console.log(e.message);
}
let Logger = new ClassLoggerHeatCapacity({mosi:D7, miso:D2, sck:A5},
                                         A4,            /* CS */
                                         {OWpin:D0},    /* temperature 1 */
                                         {OWpin:D1},    /* temperature 2 */
                                         {OWpin:D4},    /* none */
                                         A2,            /* btn1 */
                                         D12,           /* btn2 */
                                         A1,            /* none */
                                         A0             /* buz */);
Logger.Run();
LED1.write(1);