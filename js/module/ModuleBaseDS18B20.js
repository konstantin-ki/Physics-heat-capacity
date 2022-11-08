/***
 * @class
 * Класс реализует базовые операции с датчиком температуры DS18B20, используя
 * библиотеку-драйвер из экосистемы Espruino.
 * ВНИМАНИЕ: данный класс как и все последующие работающие с цифровыми шинами -
 * SPI, I2C, OneWire, UART в своем коде опирается на наличие в RUNTIME объекта-
 * контейнера данных шин. То есть при создании экземпляров класса им не передаются
 * объекты шин, ни в конструкторе ни в в одном из методов, при этом считается что на
 * момент создания объектов таких прикладных классов как ClassBaseDS18B20, и
 * производных от них, объекты шин созданы и доступны по ФИКСИРОВАННЫМ именам.
 * При этом объекты таких шин-контейнеров построены по паттерну SINGLETON, и в
 * RUNTIME находится ровно один такой объект.
 * В данном классе используется ГЛОБАЛЬНЫЙ объект-контейнер OW шин, с именем объекта - OWbus

 * 
 */
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
    /**
     * @method
     * Метод выполняет инициализацию датчика
     */
    InitDS18B20() {
        //данную конструкцию расскоментировать в случае скачивания проекта с гитхаба, в таком случае
        //локальные библиотеки будет недоступны
        //const _ClassAppError = require('https://github.com/konstantin-ki/Physics-heat-capacity/blob/main/js/module/ModuleAppError.js'); //импортируем прикладной класс ошибок
        /* DEBUG>> конструкция на момент написания программы не работает !
        const _ClassAppError = require('ModuleAppError');
        */
        PixelNRFmanagement.SleepNRF(); //отключаем BLE через вызов SleepNRF() глобального объекта PixelNRFmanagement

        /* создаем замыкание, внутри выполняем одну и туже итерацию N-раз пока либо не выполнится инициализация
        либо истечет количество попыток инициализации */
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

exports = ClassBaseDS18B20; //экспортируем класс, ВНИМАНИЕ - именно класс а не объект!