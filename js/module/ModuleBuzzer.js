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
        this.name = 'ClassBuzzer'; //переопределяем имя типа
        /*проверить переданные аргументы на валидность*/
        if(!(_opt instanceof ClassBuzzerType)) {
            
            throw new err(ClassBuzzer.ERROR_MSG_ARG_VALUE ,
                          ClassBuzzer.ERROR_CODE_ARG_VALUE);
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
    static get ERROR_MSG_ARG_VALUE() { return `ERROR>> invalid data. ClassID: ${this.name}`; }
    /*******************************************END CONST****************************************/
    /**
     * @method
     * 
     * @param {Object} _opt   - объект класса ClassTypeBuzzerPlay
     */
    PlayBeep(_opt) {
        /*проверить переданные аргументы на валидность*/
        if(!(_opt instanceof ClassBuzzerTypePlay)) {
            throw new ClassAppError(ClassBuzzer.ERROR_MSG_ARG_VALUE,
                                    ClassBuzzer.ERROR_CODE_ARG_VALUE);
        }
        
        /*-сформировать двойной звуковой сигнал */
        let Thi = _opt._PulseDur; //длительность звукового сигнала
        let Tlo = Math.floor(_opt._PulseDur*(1-_opt._Proportions)/_opt._Proportions); //длительность паузы
        let beep_count = _opt._NumRep*2; //количество полупериодов(!) звукового сигнала
        let beep_flag = true;
        analogWrite(this._BuzPin, 0.5, { freq : _opt._Freq }); //включить звуковой сигнал
        let beep_func = ()=>{
            --beep_count;
            if (beep_count > 0) {
                if (beep_flag) {
                    digitalWrite(this._BuzPin, beep_flag); //выключить звук
                        setTimeout(beep_func, Tlo); //взвести setTimeout
                } else {
                    analogWrite(this._BuzPin, 0.5, {freq: _opt._Freq}); //включить звук
                        setTimeout(beep_func, Thi); //взвести setTimeout
                }
                beep_flag = !beep_flag;
            }
        }
        setTimeout(beep_func, Thi);
    }
}

exports = ClassBuzzer;