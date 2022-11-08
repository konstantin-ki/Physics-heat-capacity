/**
 * @class
 * Класс ErrorAppUser наследует и расширяет возможности базового класса ошибок.
 * Класс предназначен для поддержки ошибок в прикладных программах Espruino
 */
class ClassAppError extends Error {
    constructor(_message, _code) {
        //super(_message);
        this.message = _message;
        this.name = "ClassAppError"; //переопределяем имя типа
        this.Code = _code || 0; //поле с кодом ошибки
    }
}

exports = ClassAppError; //экспортируем класс, ВНИМАНИЕ - именно класс а не объект!