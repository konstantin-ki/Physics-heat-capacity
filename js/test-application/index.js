class ErrorAppUser extends Error {
    constructor(_message, _code) {
        this.message = _message;
        this.name = "ErrorAppUser"; //переопределяем имя типа
        this.Code = _code || 0; //поле с кодом ошибки
    }
}

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
     * @method
     * Метод AddBus создает объект экземпляр класса SPI, как soft реализацию SPI шины.
     * Методу передается в качестве аргумента объект с параметрами создаваемой шины.
     * @param {ObjectSPIBusParam}   _opt        1 - объект с параметрами шины SPI
     * @returns {Object}            _retVal     1 - возвращаемый объект вида:
     *                                          { NameBus: bus_name, //имя созданной шины
     *                                            IDbus:   this.SPIbus.bus_name.IDbus //объект шины SPI
     *                                          }
     */
    AddBus(_opt) {
        /* данную конструкцию конструкцию расскоментировать в случае скачивания проекта с гитхаба, в таком случае
           локальна библиотека будет недоступна*/
        //const ClassErrorAppUser = require('https://github.com/konstantin-ki/Physics-heat-capacity/blob/main/js/module/ModuleAppError.js'); //импортируем прикладной класс ошибок

        const ClassErrorAppUser = require('ModuleAppError');
        /*проверить переданные параметры шины на валидность*/
        if ((typeof (_opt.mosi) === undefined) || (typeof (_opt.miso) === undefined) || (typeof (_opt.sck) === undefined)) {
            throw new ClassErrorAppUser(ClassBaseSPIBus.ERROR_MSG_ARG_MOSI_MISO_SCK_NOT_DEFINED,
                ClassBaseSPIBus.ERROR_CODE_ARG_MOSI_MISO_SCK_NOT_DEFINED);
        }

        if (!(_opt.mosi instanceof Pin) || !(_opt.miso instanceof Pin) || !(_opt.sck instanceof Pin)) {
            throw new ClassErrorAppUser(ClassBaseSPIBus.ERROR_MSG_SPI_PIN_NOT_EXISTING,
                ClassBaseSPIBus.ERROR_CODE_SPI_PIN_NOT_EXISTING);
        }

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

class ClassBaseSDcard {
    /**
     * @constructor
     * @param {ObjectSPIBusParam}   _spiOpt   1 - объект содержащий Pin-ы шины SPI, объект типа ObjectSPIBusParam, см. модуль ModuleBaseSPI
     * @param {Object}              _csPin    2 - Pin отвечающий за сигнал CS карты  SD
     */
    constructor(_spiOpt, _csPin) {
        /* данную конструкцию конструкцию расскоментировать в случае скачивания проекта с гитхаба, в таком случае
           локальна библиотека будет недоступна*/
        //this.ClassErrorAppUser = require('https://github.com/konstantin-ki/Physics-heat-capacity/blob/main/js/module/ModuleAppError.js'); //импортируем прикладной класс ошибок

        this.ClassErrorAppUser = require('ModuleAppError');

        /*проверить переданные аргументы на валидность*/
        if (typeof (_csPin) === undefined) {
            throw new ClassErrorAppUser(ClassBaseSDcard.ERROR_MSG_ARG_NOT_DEFINED + ". Arg error: _csPin",
                ClassBaseSDcard.ERROR_CODE_ARG_NOT_DEFINED);
        }

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
        this.SD.CSpin = _csPin; //объект Pin для формирования сигнала CS карты SD

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
     * Метод ConnectSD "монтирует" карту SD в систему
     */
    ConnectSD() {
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

let SPIbus = {};
let sd = {};
try {
    console.log(`DEBUG>> new ClassBaseSPIBus()`);
    SPIbus = new ClassBaseSPIBus();//new ClassSPIbus();
} catch (e) {
    console.log(e.message);
}
try {
    console.log(`DEBUG>> new ClassBaseSDcard({mosi:D7, miso:D2, sck:A5}, A4)`);
    sd = new ClassBaseSDcard({mosi: D7, miso: D2, sck: A5}, A4);//new ClassSDcard({mosi: D7, miso: D2, sck: A5}, A4);
} catch (e) {
    console.log(e.message);
}

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