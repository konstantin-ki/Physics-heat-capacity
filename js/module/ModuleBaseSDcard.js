/**
 * Класс ClassBaseSDcard реализует базовые операции с SD картой.
 * Задачи класса динамически создавать объекты для работы с SD картами и обеспечивать
 * прикладные классы  операциями чтения, записи, системными и др.
 * Класс в своей работе требует передачи ему объекта обслуживающего SPI шины в системе.
 * 
 *  * Для работы класса понадобятся пользовательские типы данных, в том числе для передачи параметров.
 * Далее представлены определения этих типов в соответствии с синтаксисом JSDoc.
 * @typedef  {Object} ObjectSPIBusParam - тип аргумента метода AddBus
 * @property {Object} mosi      1 - порт MOSI шины SPI, обязательное поле
 * @property {Object} miso      2 - порт MISO шины SPI, обязательное поле
 * @property {Object} sck       3 - порт SCK шины SPI, обязательное поле
 * 
 * @param {ObjectSPIBusParam}   _opt        1 - экземпляр класса ClassBaseSDcard
 * @param {Object}              _csPin      2 - Pin отвечающий за сигнал CS карты  SD
 * @param {Object}              _butPin     3 - Pin отвечающий за кнопку
 * @param {Object}              _ledInd     4 - Pin отвечающий за индикацию
 */
class ClassBaseSDcard {
    constructor(_opt, _csPin, _butPin, _ledPin) {
        //***************************Блок объявления полей класса****************************
        this.ClassErrorAppUser = require('ErrorAppUser'); //импортируем прикладной класс ошибок

        /*проверить переданные аргументы шины на валидность*/
        if (typeof (_csPin) === undefined || typeof (_butPin) === undefined || typeof (_ledPin) === undefined) {
            //*DEBUG*/console.log("ClassBaseSDcard.ERROR_MSG_ARG_NOT_DEFINED");
            throw new ClassErrorAppUser(ClassBaseSDcard.ERROR_MSG_ARG_NOT_DEFINED,
                                        ClassBaseSDcard.ERROR_CODE_ARG_NOT_DEFINED);
        }
        /*аргументы относящиеся к SPI шине проверяются на валидность в модуле ClassBaseSPIBus*/
        this.SD = {
            SPIBusParam: _opt, //объект с параметрами SPI шины
            CSpin: _csPin //объект Pin для формирования сигнала CS карты SD
        };
        this.StatusButton = _butInd; //Pin кнопки, для ручного action unmount
        this.StatusInd = _ledPin; //Pin светодиода, отображение статуса unmount
        this._FlagStatusSD = false; //флаг характеризующий состояние SD карты mount/unmount

        //***************************Блок инициализирующих методов конструктора***************
        this.ConnectSD(); //смонтировать SD карту
        this.CompleteWorkSD(); //запустить мониторинг кнопки управления статусом SD карты (смонтирована/размонтирована)
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
     * Метод ConnectSD "монтирует" карту SD
     */
    ConnectSD() {
        E.connectSDCard(this.SD.SPIBusParam, this.SD.CSpin);
        this.FlagStatusSD = true; //карта смонтирована
        //*DEBUG*/ console.log(`DEBUG-> SD card mount`); //DEBUG
        //*DEBUG*/ Terminal.println(`SD card mount`); //DEBUG
    }
    /**
     * Метод DisconnectSD "размонтирует" карту SD, готовя ее к извлечению
     */
    DisconnectSD() {
        E.unmountSD();
        digitalWrite(this.StatusInd, 1); //включить светодиод сигнализирующий о размонтировании SD карты
        this.FlagStatusSD = false; //карта размонтирована
        //*DEBUG*/ console.log(`DEBUG-> SD card unmount`);
        //*DEBUG*/ Terminal.println(`SD card umount`);
    }
    /**
     * Метод CompleteWorkSD позволяет размонтировать карту в ручном режиме, нажав кнопку.
     * Для работы необходимо передать порт на котором работает кнопка
     */
    CompleteWorkSD() {
        //мониторим кнопку, сработка при отпускании кнопки
        setWatch(this.DisconnectSD.bind(this), this.StatusButton, {
            edge: "falling",
            debounce: 50,
            repeat: true
        });
    }

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