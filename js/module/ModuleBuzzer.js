/**
 * @class
 * Класс ClassTypeBuzzer обеспечивает прикладной тип для конструктора класса ClassBuzzer.
 * Пример набора аргументов конструктора:
 * {A4 /порт/, 4500 /герц/}
 */
class ClassTypeBuzzer {
    /**
     * @constructor
     * @param {Object} _buzPin      - Pin на котором сидит buzzer
     */
    constructor(_buzPin) {
        this._BuzPin = undefined;

        this.Init(_buzPin); //инициализировать поля
    }
    /*******************************************CONST********************************************/
    /**
     * @const
     * @type {number}
     * Константа ERROR_CODE_ARG_VALUE определяет код ошибки, которая может произойти
     * в случае передачи не валидных данных
     */
    static get ERROR_CODE_ARG_VALUE() { return 10; }
    /**
     * @const
     * @type {string}
     * Константа ERROR_MSG_ARG_VALUE определяет сообщение ошибки, которая может произойти
     * в случае передачи не валидных данных
     */
    static get ERROR_MSG_ARG_VALUE() { return 'ERROR>> invalid data ClassTypeBuzzerPlay'; }
    /*******************************************END CONST****************************************/
    /**
     * Метод инициализирует поля объекта
     */
    Init(_buzPin) {        
        /*проверить переданные аргументы на валидность*/
        if (!(typeof (_buzPin) === 'undefined')) {
           throw new ClassAppError(ClassTypeBuzzer.ERROR_CODE_ARG_VALUE,
                                     ClassTypeBuzzer.ERROR_MSG_ARG_VALUE);
        }
        if(!(_buzPin instanceof Pin)) {
            throw new ClassAppError(ClassTypeBuzzer.ERROR_CODE_ARG_VALUE,
                                     ClassTypeBuzzer.ERROR_MSG_ARG_VALUE);
        }
        /*инициализировать поля*/
        this._BuzPin = _buzPin;
    }
}
/**
 * @class
 * Класс ClassTypeBuzzerPlay обеспечивает прикладной тип для методов класса ClassBuzzer.
 * Пример набора аргументов конструктора:
 * {4 /импульса/, 200 /ms длительность/, 0.5 /50% скважность/}
 */
class ClassTypeBuzzerPlay {
    /**
     * @constructor
     * @param {number} _pulseDur    - длительность звучания в ms [50<=x<infinity]
     * @param {number} _numRep      - количество повторений [1...n]
     * @param {number} _freq        - рабочая частота buzzer
     * @param {number} _prop        - пропорция ЗВУК/ТИШИНА на одном периоде [0<x<=1]
     */
    constructor(_pulseDur, _numRep, _freq, _prop) {
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
    static get ERROR_MSG_ARG_VALUE() { return 'ERROR>> invalid data ClassTypeBuzzerPlay'; }
    /*******************************************END CONST****************************************/
    /**
     * Метод инициализирует поля объекта
     */
    Init(_pulseDur, _numRep, _freq, _prop) {
        let pulsedur = _pulseDur || 50;
        let numrep = _numRep || 1;
        let freq = _freq || 4500;
        let prop = _prop || 0.5;
        
        /*проверить переданные аргументы  на валидность*/
        if (!(typeof (pulsedur) === 'number')   ||
            !(typeof (numrep) === 'number')     ||
            !(typeof (freq) === 'number')       ||
            !(typeof (prop) === 'number')       ||
            !(Number.isInteger(_pulseDur))      ||
            !(Number.isInteger(numrep))         ||
            !(Number.isInteger(freq))) {
           throw new ClassAppError(ClassTypeBuzzerPlay.ERROR_CODE_ARG_VALUE,
                                   ClassTypeBuzzerPlay.ERROR_MSG_ARG_VALUE);
        }
        if (pulsedur<50) {pulsedur=50;} //нормализовать значение длительности импульса звучания
        if (prop<0 || prop>1) {prop=1;}
        
        /*инициализировать поля*/
        this._PulseDur = pulsedur;
        this._NumRep = numrep;
        this._Freq = freq;
        this._Proportions = prop;
    }
}
/**
 * @class
 * Класс ClassBuzzer реализует логику работы пьезодатчика
 */
class ClassBuzzer {
    /**
     * @constructor
     * @param {Object} _opt   - объект класса ClassTypeBuzzer
     */
    constructor(_opt) {
        
        /*проверить переданные аргументы на валидность*/
        if(!(_opt instanceof ClassTypeBuzzer)) {
            throw new ClassAppError(ClassBuzzer.ERROR_CODE_ARG_VALUE,
                                    ClassBuzzer.ERROR_MSG_ARG_VALUE);
        }
        this._BuzPin = _opt._BuzPin; 
    }
    /*******************************************CONST********************************************/
    /**
     * @const
     * @type {number}
     * Константа ERROR_CODE_ARG_VALUE определяет код ошибки, которая может произойти
     * в случае передачи не валидных данных
     */
    static get ERROR_CODE_ARG_VALUE() { return 10; }
    /**
     * @const
     * @type {string}
     * Константа ERROR_MSG_ARG_VALUE определяет сообщение ошибки, которая может произойти
     * в случае передачи не валидных данных
     */
    static get ERROR_MSG_ARG_VALUE() { return 'ERROR>> invalid data ClassTypeBuzzerPlay'; }
    /*******************************************END CONST****************************************/
    /**
     * @method
     * 
     * @param {Object} _opt   - объект класса ClassTypeBuzzerPlay
     */
    PlayBeep(_opt) {
        /*проверить переданные аргументы на валидность*/
        if(!(_opt instanceof ClassTypeBuzzerPlay)) {
            throw new ClassAppError(ClassBuzzer.ERROR_CODE_ARG_VALUE,
                                    ClassBuzzer.ERROR_MSG_ARG_VALUE);
        }
        
        /*-сформировать двойной звуковой сигнал */
        let Thi = opt._PulseDur; //длительность звукового сигнала
        let Tlo = _opt._PulseDur*(1-_opt._Proportions)/_opt._Proportions; //длительность паузы
        let beep_count = _opt._NumRep; //переменная помогает организовать двойной звуковой сигнал
        let beep_flag = true;
        analogWrite(this._BuzPin, 0.5, { freq : _opt._Freq }); //включить звуковой сигнал
        let beep_func = ()=>{
            --beep_count;
            if (beep_count > 0) {
                if (beep_flag) {
                    digitalWrite(this._BuzPin, beep_flag); //выключить звук
                } else {
                    analogWrite(this._BuzPin, 0.5, {freq: _opt._Freq}); //включить звук
                }
                beep_flag = !beep_flag;
                setTimeout(beep_func, Tlo); //взвести setTimeout
            }
        }
        setTimeout(beep_func, Thi);
    }
}