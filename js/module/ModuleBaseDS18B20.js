/***
 * @class
 * Класс реализует базовые операции с датчиком температуры DS18B20, используя
 * библиотеку-драйвер из экосистемы Espruino.
 * ВНИМАНИЕ: данный класс как и все последующие работающие с цифровыми шинами -
 * SPI, I2C, OneWire, UART в своем коде опирается на наличие в RUNTIME объекта-
 * контейнера данных шин. То есть при создании экземпляров класса им не передаются
 * объекты шин, ни в конструкторе ни в в одном из методов, при этом считается что на
 * момент создания объектов таких прикладных классов как ClassBaseTempeature, и
 * производных от них, объекты шин созданы и доступны по ФИКСИРОВАННЫМ именам.
 * При этом объекты таких шин-контейнеров построены по паттерну SINGLETON, и в
 * RUNTIME находится ровно один такой объект.
 * В данном классе используется ГЛОБАЛЬНЫЙ объект-контейнер OW шин, с именем объекта - OWbus

 * 
 */
class ClassBaseTempeature {
    /**
     * @constructor
     * @param {*} _opt              1 - объект {OWpin: <Pin class>} объект с параметрами OW шины 
     * @param {*} [_sensRes]        2 - разрешение датчика в битах, может принимать значения  9...12
     */
    constructor(_opt, _sensRes) {

        this.OW = OWbus.AddBus(_opt); //получить шину OneWire ВНИМАНИЕ:  OWbus - глобальный объект (!), создан в секции RUNTIME
        this.DS18B20 = undefined; //это поле будет хранить экземпляр первого объекта-драйвера датчика
        this.Resolution = _sensRes || 10; //задать разрешение датчика по температуре, default 10 bit
        this.FlagRunInit = false; //флаг инициализации датчика температуры -  успешно/не успешно
        this._FlagFinalInit = false; //флаг окончания процедуры инициализации
        this.TimeCycleReInit = 20; //время в ms повторной инициализации датчика        
        //this.CycleTimeReadTemp = _cycleTime || 1000; //задать период в ms считывания показания температуры термо-датчика {1000}
        this.IdTimerTemp = undefined; //id таймера на считывание температуры
        this._CurTemp = 0; //хранит текущую температуру полученную от датчика

        ReadTempBind = this.ReadTemp.bind(this); //поле является Bind версией метода ReadTemp;
    }
        /**
     * @const
     * @type {number}
     * Статическая константа ERROR_CODE_INIT_CRASH_DS18B20 определяет КОД ошибки, которая может
     * произойти в случае если все попытки инициализации датчика завершились неудачей.
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
     * Методы возвращает флаг, характеризующий завершение/работу процедуры инициализации датчика 
     */
    get FlagFinalInit() { return this._FlagFinalInit; }
    /**
     * @method
     * Метод устанавливает флаг, характеризующий завершение / работу процедуры инициализации датчика
     */
    set FlagFinalInit(_flag) { this._FlagFinalInit = _flag; }
    /**
     * @method
     * Метод возвращает значение поля, хранящего значение последней измеренной температуры
     */
    get CurTemp() { return this._CurTemp; }
    /**
     * @method
     * Метод устанавливает значение поля, хранящего значение последней измеренной температуры
     */
    set CurTemp(_temp) { this._CurTemp = _temp; }
    /**
     * @method
     * Метод InitInfo часть интерфейса класса ClassBaseTempeature, предназначенный для переопределения в
     * классах потомках. Назначение метода - информировать пользователя о ходе процесса инициализации
     * датчика. Решение о том как это делать должно быть реализовано в классах потомках.
     * В данном классе метод ничего не делает.
     * @param {Object}   _opt        1 - объект с произвольными параметрами
     */
    InitInfo(_opt){

    }
    /**
     * @method
     * Метод выполняет инициализацию датчика
     */
    InitDS18B20() {
        /* данную конструкцию конструкцию расскоментировать в случае скачивания проекта с гитхаба, в таком случае
           локальна библиотека будет недоступна*/
        //const ClassErrorAppUser = require('https://github.com/konstantin-ki/Physics-heat-capacity/blob/main/js/module/ModuleAppError.js'); //импортируем прикладной класс ошибок
        const ClassErrorAppUser = require('ModuleAppError');

        const init_ds18b20 = ()=>{
            // проверяем создание статической переменной функции
            if ( typeof (init_ds18b20.static_counter_init) === 'undefined' ) {
                init_ds18b20.static_counter_init = 0;
            }
            if ( !this.FlagRunInit ) {
                if (init_ds18b20.static_counter_init < this.COUNT_INIT_MAX) {
                    setTimeout(() => {
                        this.InitInfo({Stage: 'run_init', Error: {}});
                        //Terminal.println(`N${init_ds18b20.static_counter_init+1} - attempt create driver...`);
                        try {
                            this.DS18B20 = require("DS18B20").connect(this.OW); //создать драйвер датчика и инициализировать его
                        } catch (e) {
                            this.InitInfo({Stage: 'run_init', Error: e}); //если инициализация завершилась неудачей    
                            //Terminal.println(`N${init_ds18b20.static_counter_init+1} - error ` + error.message);
                            //Terminal.println('##########');
                            //*DEBUG*/console.log(`N${init_ds18b20.static_counter_init+1} - catch error ` + error.message); //DEBUG
                            ++init_ds18b20.static_counter_init; //увеличить счетчик попыток
                            init_ds18b20();
                        }
                        this.FlagRunInit = true; //датчик температуры инициализирован
                        this.FlagFinalInit = true; //установить флаг завершения инициализации
                        this.InitInfo( {Stage: 'final_init', Error: {}} );
                        //Terminal.println(`N${init_ds18b20.static_counter_init+1} - Create driver successfully !`);
                        //Terminal.println('##########');
                    }, this.TimeCycleReInit);
                } else {
                    throw new ClassErrorAppUser(ClassBaseTempeature.ERROR_MSG_INIT_CRASH_DS18B20,
                                                ClassBaseTempeature.ERROR_CODE_INIT_CRASH_DS18B20);
                    this.InitInfo({
                        Stage: 'final_init',
                        Error: new ClassErrorAppUser(ClassBaseTempeature.ERROR_MSG_INIT_CRASH_DS18B20,
                                                     ClassBaseTempeature.ERROR_CODE_INIT_CRASH_DS18B20)
                    });//использованы все попытки инициализировать драйвер датчика
                    //Terminal.println(' ');
                    //Terminal.println('DS18B20 INIT CRASH !');
                }
            }
        };
        //*DEBUG*/console.log(`Start init_ds18b20 function...`); //DEBUGs
        init_ds18b20(); //запускаем функцию  
    }
    /**
     * 
     */
    ReadTemp() {
        let temp_data = this.DS18B20.getTemp(); //вспомагательная переменная которая хранит "сырое" (до обработки)
        this.CurTemp = (temp_data === null) ? this.CurTemp : temp_data; //обработать считанное значение температуры и записать в поле
    }
}