/*######################################################################################################*/
/**
 * Класс ErrorAppUser наследует и расширяет возможности базового класса ошибок.
 * Класс предназначен для поддержки ошибок в прикладных программах Espruino
 */
class ErrorAppUser extends Error {
    constructor(_message, _code) {
        this.message = _message;
        this.name = "ErrorAppUser"; //переопределяем имя типа
        this.Code = _code || 0; //поле с кодом ошибки
    }
}
/*######################################################################################################*/
/**
 * @class
 * Класс ClassBaseSPIBus реализует базовые операции по созданию общего для проекта
 * хранилища объектов SPI шины.
 * Задачи класса динамически создавать и добавлять в контейнер новый объект SPI шины и предоставлять
 * прикладным классам экземпляры объектов, а также хранить информацию о том - занята данная, конкретная
 * шина или нет.
 * Класс хранит экземпляры предопределенных в Espruino SPI шин (SPI1, SPI2, SPI3),
 * а также создает soft шины SPI. При создании возвращается объект типа SPI шина.
 * Класс реализует паттерн - синглтон, т.е. экземпляр класса может быть только один.
 * 
 * 
 * Для работы класса понадобятся пользовательские типы данных, в том числе для передачи параметров.
 * Далее представлены определения этих типов в соответствии с синтаксисом JSDoc.
 * 
 * тип для передачи аргументов для генерации SPI объекта
 * @typedef  {Object} ObjectSPIBusParam - тип аргумента метода AddBus
 * @property {Object} mosi      1 - порт MOSI шины SPI, обязательное поле
 * @property {Object} miso      2 - порт MISO шины SPI, обязательное поле
 * @property {Object} sck       3 - порт SCK шины SPI, обязательное поле
 * Пример объекта с аргументами для генерации SPI объекта:
 * { mosi: D2, miso: D7, sck: A5 }
 * 
 * Тип для хранения сгенерированных объектов-шин SPI в экземпляре класса ClassBaseSPIBus
 * Фактически это тип поля SPIbus
 * @typedef  {Object} ObjectSPIcontainer     - тип контейнер хранящий сгенерированные шины
 * @property {Object} BusObjName            - ДИНАМИЧЕСКИ генерируемый ключ записи объекта.
 * Значение  * ключа представляет собой объект хранящий собственно генерируемую SPI шину а также
 * ряд прикладных характеристик, например используется ли в RUNTIME данная шина или свободна.
 * Имя ключа генерируется на основе паттерна SPIxx, т.е. итоговые имена могут быть: SPI10, SPI11...SPI19...
 * количество шин не ограничено.
 * Далее представлена структура объекта - значения:
 * {
 *  IDbus: <spi bus object those - result new SPI()>, //сгенерированный экземпляр шины SPI
 *  Used: true/false //состояние шины используется (true), не используется (false)
 * }
 * 
 */
class ClassBaseSPIBus {
    /**
     * @constructor
     */
    constructor() {
        this.Instance = null; //поле на основе которого реализуется синглтон

        this.SPIbus = {}; //контейнер объектов-шин SPI
        this.Pattern = 'SPI'; //базовая часть всех ключей объектов-шин SPI, полное название получается конкатенацией с текущим индексом
        this.IndexBus = 10; //начальный индекс soft шин, полный индекс будет вида SPI11, SPI12, SPI13 и т.д.

        //далее инициализируем контейнер первыми тремя шинами которые предустановлены в Espruino
        //это SPI1, SI2, SPI3. Свойство Used это индикатор использования шины
        this.SPIbus.SPI1 = {
            IDbus: SPI1,
            Used: false
        };
        //this.SPIbus['SPI2'] = {IDbus: SPI2, Used: false};
        //this.SPIbus['SPI3'] = {IDbus: SPI3, Used: false};

        //реализация паттерна синглтон
        if (this.Instance) {
            return this.Instance;
        } else {
            ClassBaseSPIBus.prototype.Instance = this;
        }
    }
    /***********************************************КОНСТАНТЫ КЛАССА***********************************************/
    /**
     * Константа ERROR_CODE_ARG_MOSI_MISO_SCK_NOT_DEFINED определяет КОД ошибки,
     * которая может произойти при вызове метода AddBus в том случае если не был
     * передан один или более портов MOSI, MISO, SCK необходимых для создания SPI шины
     */
    static get ERROR_CODE_ARG_MOSI_MISO_SCK_NOT_DEFINED() {
        return 10;
    }
    /**
     * Константа ERROR_MSG_ARG_MOSI_MISO_SCK_NOT_DEFINED определяет СООБЩЕНИЕ ошибки,
     * которая может      * произойти при вызове метода AddBus в том случае если не был
     * передан один или более портов MOSI, MISO, SCK необходимых для создания SPI шины
     */
    static get ERROR_MSG_ARG_MOSI_MISO_SCK_NOT_DEFINED() {
        return 'Error -> The MOSI, MISO, SCK port is not defined';
    }
    /**
     * Константа ERROR_CODE_SPI_PIN_NOT_EXISTING определяет КОД ошибки, которая может
     * произойти в случае если для создания SPI шины были переданы не существующие порты
     * микроконтроллера, или занятые другими объектами
     */
    static get ERROR_CODE_SPI_PIN_NOT_EXISTING() {
        return 20;
    }
    /**
     * Константа ERROR_MSG_SPI_PIN_NOT_EXISTING определяет СООБЩЕНИЕ ошибки, которая может
     * произойти в случае если для создания SPI шины были переданы не существующие порты
     * микроконтроллера, или занятые другими объектами
     */
    static get ERROR_MSG_SPI_PIN_NOT_EXISTING() {
        return 'Error -> The SPI pin not existing';
    }
    /**
     * Метод AddBus создает объект экземпляр класса SPI, как soft реализацию SPI шины.
     * Методу передается в качестве аргумента объект с параметрами создаваемой шины.
     * @param {ObjectSPIBusParam}   _opt        1 - объект с параметрами шины SPI
     * @returns {Object}            _retVal     1 - возвращаемый объект вида:
     *                                          { NameBus: bus_name, //имя созданной шины
     *                                            IDbus:   this.SPIbus.bus_name.IDbus //объект шина SPI
     *                                          }
     */
    AddBus(_opt) {
        const ClassErrorAppUser = require('https://github.com/konstantin-ki/Espruino/blob/main/Library/ModuleAppError.js'); //импортируем прикладной класс ошибок
        /*проверить переданные параметры шины на валидность*/
        if ((typeof (_opt.mosi) === undefined) || (typeof (_opt.miso) === undefined) || (typeof (_opt.sck) === undefined)) {
            throw new ClassErrorAppUser(ClassBaseSPIBus.ERROR_MSG_ARG_MOSI_MISO_SCK_NOT_DEFINED,
                ClassBaseSPIBus.ERROR_CODE_ARG_MOSI_MISO_SCK_NOT_DEFINED);
        }

        if (!(_opt.mosi instanceof Pin) || !(_opt.miso instanceof Pin) || !(_opt.sck instanceof Pin)) {
            throw new ClassErrorAppUser(ClassBaseSPIBus.ERROR_MSG_SPI_PIN_NOT_EXISTING,
                ClassBaseSPIBus.ERROR_CODE_SPI_PIN_NOT_EXISTING);
        }
        /*DEBUG*/console.log(`ClassBaseSPIBus -> AddBus  -> 1`);
        /*все необходимые для создания шины параметры переданы -> создать и инициализировать новую шину*/
        let bus_name = this.Pattern + this.IndexBus; //полное имя ключа текущей шины

        this.SPIbus.bus_name = {
            IDbus: new SPI(), //сгенерировать шину
            Used: true //индикатор использования шины в true
        };
        this.SPIbus.bus_name.IDbus.setup(_opt); //инициализировать шину

        ++this.IndexBus; //увеличить индекс шины

        return {
            NameBus: bus_name, //имя созданной шины
            IDbus: this.SPIbus.bus_name.IDbus //объект шина SPI
        };
    }
}
/*######################################################################################################*/
/**
 * @class
 * Класс ClassBaseSDcard реализует базовые операции с SD картой.
 * Задачи класса динамически создавать объекты для работы с SD картами и обеспечивать
 * прикладные классы  операциями чтения, записи, системными и др.
 * 
 * ВНИМАНИЕ: данный класс как и все последующие работающие с цифровыми шинами -
 * SPI, I2C, OneWire, UART в своем коде опирается на наличие в RUNTIME объекта-
 * контейнера данных шин. То есть при создании экземпляров класса им не передаются
 * объекты шин, ни в конструкторе ни в в одном из методов, при этом считается что на
 * момент создания объектов таких прикладных классов как ClassBaseSDcard, и производных
 * от них, объекты шин созданы и доступны по ФИКСИРОВАННЫМ именам. При этом объекты
 * таких шин-контейнеров построены по паттерну SINGLETON, и в RUNTIME находится
 * ровно один такой объект.
 * В данном классе используется ГЛОБАЛЬНЫЙ объект-контейнер SPI шин, с именем объекта - SPIbus
 * 
 *  * Для работы класса понадобятся пользовательские типы данных, в том числе для передачи параметров.
 * Далее представлены определения этих типов в соответствии с синтаксисом JSDoc.
 * 
 * тип для передачи аргументов для генерации SPI объекта
 * @typedef  {Object} ObjectSPIBusParam - тип аргумента метода AddBus
 * @property {Object} mosi      1 - порт MOSI шины SPI, обязательное поле
 * @property {Object} miso      2 - порт MISO шины SPI, обязательное поле
 * @property {Object} sck       3 - порт SCK шины SPI, обязательное поле
 * Пример объекта с аргументами для генерации SPI объекта:
 * { mosi: D2, miso: D7, sck: A5 }
 * 
 */
class ClassBaseSDcard {
    /**
     * @constructor
     * @param {ObjectSPIBusParam}   _spiOpt   1 - объект содержащий Pin-ы шины SPI, объект типа ObjectSPIBusParam, см. модуль ModuleBaseSPI
     * @param {Object}              _csPin    2 - Pin отвечающий за сигнал CS карты  SD
     */
    constructor(_spiOpt, _csPin) {
        //***************************Блок объявления полей класса****************************
        this.ErrorAppUser = require('https://github.com/konstantin-ki/Espruino/blob/main/Library/ModuleAppError.js'); //импортируем прикладной класс ошибок

        /*проверить переданные аргументы на валидность*/
        if (typeof (_csPin) === undefined) {
            throw new ClassErrorAppUser(ClassBaseSDcard.ERROR_MSG_ARG_NOT_DEFINED + ". Arg error: _csPin",
                                        ClassBaseSDcard.ERROR_CODE_ARG_NOT_DEFINED);
        }
        /*DEBUG*/console.log(`ClassBaseSDcard -> constructor -> 1`);
        this.SD = {
            IDbus: {},
            CSpin: {}
        }; //хранит параметры физического интерфейса для подключения SD карты

        /*аргументы относящиеся к SPI шине проверяются на валидность в модуле ClassBaseSPIBus*/
        try {
            this.SD.IDbus = SPIbus.AddBus(_spiOpt).IDbus; //сгенерировать объект SPI. ВНИМАНИЕ объект SPIbus - глобальный
        } catch (e) {
            console.log(e.message); //описание исключения см. в модуле ModuleBaseSPI
        }
        /*DEBUG*/console.log(`ClassBaseSDcard -> constructor -> 2`);
        this.SD.CSpin = _csPin; //объект Pin для формирования сигнала CS карты SD
        /*DEBUG*/console.log(`ClassBaseSDcard -> constructor -> 3`);
        /*TRANSFER ВНИМАНИЕ: код подлежит переносу в класс ClassMidleSDcard
        this.StatusButton = _butInd; //Pin кнопки, для ручного action unmount
        this.StatusInd = _ledPin; //Pin светодиода, отображение статуса unmount
        */

        this._FlagStatusSD = false; //флаг характеризующий состояние SD карты mount/unmount

        //***************************Блок инициализирующих методов конструктора***************
        this.ConnectSD(); //смонтировать SD карту
        /*TRANSFER ВНИМАНИЕ: код подлежит переносу в класс ClassMidleSDcard
        this.CompleteWorkSD(); //запустить мониторинг кнопки управления статусом SD карты (смонтирована/размонтирована)
        */
    }
    /***********************************************КОНСТАНТЫ КЛАССА***********************************************/
    /**
     * Константа класса ERROR_CODE_ARG_NOT_DEFINED определяет КОД ошибки, которая может
     * произойти если при передачи в конструктор не корректных аргументов
     */
    static get ERROR_CODE_ARG_NOT_DEFINED() {
        return 10;
    }
    /**
     * Константа класса ERROR_MSG_ARG_NOT_DEFINED определяет СООБЩЕНИЕ ошибки, которая может
     * произойти если при передачи в конструктор не корректных аргументов
     */
    static get ERROR_MSG_ARG_NOT_DEFINED() {
        return 'Error -> invalid arguments the constructor';
    }
    /**
     * Константа класса ERROR_CODE_SD_UNMOUNTED определяет КОД ошибки, которая
     * возникает при попытке вызвать операцию чтения/записи при размонтированной карте
     */
    static get ERROR_CODE_SD_UNMOUNTED() {
        return 11;
    }
    /**
     * Константа класса ERROR_MSG_SD_UNMOUNTED определяет СООБЩЕНИЕ ошибки, которая
     * возникает при попытке вызвать операцию чтения/записи при размонтированной карте
     */
    static get ERROR_MSG_SD_UNMOUNTED() {
        return 'Error -> accessing the unmounted SD';
    }
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
     * Метод ConnectSD "монтирует" карту SD
     */
    ConnectSD() {
        /*DEBUG*/console.log(`ClassBaseSDcard -> ConnectSD -> 1`);
        E.connectSDCard(this.SD.IDbus, this.SD.CSpin); //инициализация SD карты в системе Espruino
        this.FlagStatusSD = true; //карта смонтирована
    }
    /**
     * Метод DisconnectSD "размонтирует" карту SD, готовя ее к извлечению
     */
    DisconnectSD() {
        E.unmountSD();
        this.FlagStatusSD = false; //карта размонтирована
        /*TRANSFER ВНИМАНИЕ: код подлежит переносу в класс ClassMidleSDcard
        digitalWrite(this.StatusInd, 1); //включить светодиод сигнализирующий о размонтировании SD карты
        TRANSFER*/

        //*DEBUG*/ console.log(`DEBUG-> SD card unmount`);
        //*DEBUG*/ Terminal.println(`SD card umount`);
    }
    /*TRANSFER ВНИМАНИЕ: метод CompleteWorkSD ПОЛНОСТЬЮ подлежит переносу в класс ClassMidleSDcard
    /**
     * Метод CompleteWorkSD позволяет размонтировать карту в ручном режиме, нажав кнопку.
     * Для работы необходимо передать порт на котором работает кнопка
     
    CompleteWorkSD() {
        //мониторим кнопку, сработка при отпускании кнопки
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
            //*DEBUG*/console.log(this.FS.readdirSync()); //вывести список файлов в консоль
            return require("fs").readdirSync(); //вернуть список файлов/директорий
        } else {
            //выбросить исключение, SD карта размонтирована
            throw new ClassErrorAppUser(ClassBaseSDcard.ERROR_MSG_SD_UNMOUNTED,
                ClassBaseSDcard.ERROR_CODE_SD_UNMOUNTED);
        }
    }
}



/*######################################################################################################*/
const ClassSPIbus = require('https://github.com/konstantin-ki/Espruino/blob/main/Library/ModuleBaseSPI.js');
const ClassSDcard = require('https://github.com/konstantin-ki/Espruino/blob/main/Library/ModuleBaseSDcard.js');

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
digitalWrite(LED1, 0); // red indicator off