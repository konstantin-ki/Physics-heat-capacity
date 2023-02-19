/**
 * @class
 * Класс ClassAppError наследует и расширяет возможности базового класса ошибок.
 */
class ClassAppError extends Error {
    constructor(_message, _code) {
        //super(_message);
        this.name = 'ClassAppError'; //переопределяем имя типа
        this._Message = _message;
        this._Code = _code || 1; //по умолчанию присвоить код неизвестной ошибки
    }
    get Message() {return this._Message;}
    get Code() {return this._Code;}
}

exports = ClassAppError; //экспортируем класс, ВНИМАНИЕ - именно класс а не объект!