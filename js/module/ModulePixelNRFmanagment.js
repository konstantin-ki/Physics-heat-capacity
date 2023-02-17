/**
 * @class
 * Класс ClassCtrlNRF предназначен для управления радиоинтерфейсом микропроцессора.
 * У данного модуля возникают сбои в портах цифровых шин при работе данного радиомодуля
 * это связано что работа модуля может прервать на некоторое время (по прерыванию) работу 
 * других шин как аппаратных таки программных. В форуме Гордона он сам на это указывал 
 * одному из участников, от туда я и понял проблемы которые происходили в данной программе 
 * с участком кода где происходила инициализация датчика температуры DS18B20. Его протокол
 * чувствителен к задержкам. 
 */
class ClassPixelNRFmanagement {
    /**
     * @constructor
     */
    constructor(_callback) {
        this._StatusNRFcallback = _callback; //поле хранит внешнюю функцию которая вызывается при смене статуса NRF
        this._FlagWorksNRF = true; //поле-флаг управление NRF интерфейсом, исх состояние BLE => работает

        //***************************Блок инициализирующих методов конструктора***************
    }
    /**
     * @method
     * Метод отправляет BLE интерфейс в sleep режим и выполняет сопутствующие действия
     */
    SleepNRF() {
        NRF.sleep(); //отключить BLE интерфейс
            this._FlagWorksNRF = false; //поле-флаг управление NRF интерфейсом установить в <false>
        if(!this._StatusNRFcallback === undefined){ this._StatusNRFcallback(this._FlagWorksNRF); }
    }
    /**
     * Метод WakeNRF активирует BLE интерфейс и выполняет сопутствующие действия
     */
    WakeNRF() {
        NRF.wake(); //включить BLE интерфейс
            this._FlagWorksNRF = true; //поле-флаг управление NRF интерфейсом установить в true
        if(!this._StatusNRFcallback === undefined){ this._StatusNRFcallback(this._FlagWorksNRF); }
    }
    /**
     * @method
     *	Метод OnOffNRF инвертирует состояние NRF интерфейса 
     */
    OnOffNRF() {
        if (this._FlagWorksNRF) {
            this.SleepNRF();
        } else {
            this.WakeNRF();
        }
        this._FlagWorksNRF = !this._FlagWorksNRF; //инвертировать флаг
    }
}

exports = ClassPixelNRFmanagement; //экспортируем класс, ВНИМАНИЕ - именно класс а не объект!