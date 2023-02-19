/**
 * Метод расширяет функционал объекта типа Number. Данный типа в реализации Espruino не
 * поддерживает стандартный для JS метод isInteger.
 */
function AddIsInteger() {
    /**
     * @param {number} it  - проверяемое число
     */
    Number.isInteger = (it) => {isFinite(it) && Math.floor(it) === it};
}

exports = AddIsInteger;