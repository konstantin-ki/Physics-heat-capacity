//экспортировать объект прикладных ошибок
const err = require('https://raw.githubusercontent.com/konstantin-ki/Physics-heat-capacity/ver2/js/module/ModuleAppError.js');

/**
 * @class
 * Класс ClassBuzzerTypePlay обеспечивает прикладной тип для методов класса ClassBuzzer.
 * Пример набора аргументов конструктора:
 * {4 /импульса/, 200 /ms длительность/, 0.5 /50% скважность/}
 */
class ClassBuzzerTypePlay {
    /**
     * @constructor
     * @param {number} _pulseDur    - длительность звучания в ms [50<=x<infinity]
     * @param {number} _numRep      - количество повторений [1...n]
     * @param {number} _freq        - рабочая частота buzzer
     * @param {number} _prop        - пропорция ЗВУК/ТИШИНА на одном периоде [0<x<=1]
     */
    constructor(_pulseDur, _numRep, _freq, _prop) {
        this.name = 'ClassBuzzerTypePlay'; //переопределяем имя типа
        this._PulseDur = undefined;
        this._NumRep = undefined;
        this._Freq = undefined;
        this._Proportions = undefined;
        
        this.Init(_pulseDur, _numRep, _freq, _prop); //инициализировать поля
    }
    /*******************************************CONST********************************************/
    /**
     * @const
     * @type {number}
     * Константа ERROR_CODE_ARG_VALUE определяет код ошибки, которая может произойти
     * в случае передачи в конструктор не валидных данных
     */
    static get ERROR_CODE_ARG_VALUE() { return 10; }
    /**
     * @const
     * @type {string}
     * Константа ERROR_MSG_ARG_VALUE определяет сообщение ошибки, которая может произойти
     * в случае передачи в конструктор не валидных данных
     */
    static get ERROR_MSG_ARG_VALUE() { return `ERROR>> invalid data. ClassID: ${this.name}`; }
    /*******************************************END CONST****************************************/
    /**
     * Метод инициализирует поля объекта
     */
    Init(_pulseDur, _numRep, _freq, _prop) {
        let pulsedur = _pulseDur || 100;
        let numrep = _numRep || 1;
        let freq = _freq || 4000;
        let prop = _prop || 0.5;
        
        /*проверить переданные аргументы  на валидность*/
        if (!(typeof (pulsedur) === 'number')   ||
            !(typeof (numrep) === 'number')     ||
            !(typeof (freq) === 'number')       ||
            !(typeof (prop) === 'number')       ||
            !(Number.isInteger(pulsedur))       ||
            !(Number.isInteger(numrep))         ||
            !(Number.isInteger(freq))) {
                
                throw new err(ClassTypeBuzzerPlay.ERROR_MSG_ARG_VALUE,
                              ClassTypeBuzzerPlay.ERROR_CODE_ARG_VALUE);
        }
        if (pulsedur<50) {pulsedur=50;} //нормализовать значение длительности импульса звучания
        if (prop<0 || prop>1) {prop=0.5;}
        
        /*инициализировать поля*/
        this._PulseDur = pulsedur;
        this._NumRep = numrep;
        this._Freq = freq;
        this._Proportions = prop;
    }
}

exports = ClassBuzzerTypePlay;