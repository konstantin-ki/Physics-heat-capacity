//экспортировать объект прикладных ошибок
const err = require('https://raw.githubusercontent.com/konstantin-ki/Physics-heat-capacity/ver2/js/module/ModuleAppError.js');

/**
 * @class
 * Класс ClassBuzzerType обеспечивает прикладной тип для конструктора класса ClassBuzzer.
 * Пример набора аргументов конструктора:
 * {A4 /порт/, 4500 /герц/}
 */
class ClassBuzzerType {
    /**
     * @constructor
     * @param {Object} _buzPin      - Pin на котором сидит buzzer
     */
    constructor(_buzPin) {
        this.name = 'ClassBuzzerType'; //переопределяем имя типа
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
    static get ERROR_MSG_ARG_VALUE() { return `ERROR>> invalid data. ClassID: ${this.name}`; }
    /*******************************************END CONST****************************************/
    /**
     * Метод инициализирует поля объекта
     */
    Init(_buzPin) {        
        /*проверить переданные аргументы на валидность*/
        if ((typeof (_buzPin) === 'undefined')) {
            
            throw new err(ClassTypeBuzzer.ERROR_MSG_ARG_VALUE ,
                          ClassTypeBuzzer.ERROR_CODE_ARG_VALUE);
        }
        if(!(_buzPin instanceof Pin)) {
            
            throw new err(ClassTypeBuzzer.ERROR_MSG_ARG_VALUE,
                          ClassTypeBuzzer.ERROR_CODE_ARG_VALUE);
        }
        /*инициализировать поля*/
        this._BuzPin = _buzPin;
    }
}

exports = ClassBuzzerType;