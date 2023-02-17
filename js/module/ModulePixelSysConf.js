/**
 * Класс ClassPixeljsSysConf предназначен для системных операций и контроля платформы.
 * В том числе формирует работу с системной датой
 */
class ClassPixelSysConf {
    constructor() {
        E.setTimeZone(4); //установить временную зону - Самара
    }
    /**
     * Метод геттер <DateCurrent> возвращает тестовую строку текущей Дата/Время
     */
    get DateCurrent() {
        return new Date().toString();
    }
    /**
     * Сеттер устанавливает текущую Дата/Время
     */
    set DateCurrent(_argVal) {
        let date = (_argVal) => {
            new Date(_argVal[0], _argVal[1], _argVal[2], _argVal[3], _argVal[4], _argVal[5], 0); //инициализировать системное время
        };
        date(_argVal);
    }
    /**
     * Метод геттер DateCurrentNow возвращает текущее время в миллисекундах 
     */
    get DateCurrentNow() {
        return new Date().now();
    }
    /**
     * Метод очищает экран LCD при старте программы
     */
    ClearLCD() {
        g.clear(); //убрать стартовые надписи с экрана
        g.flip(); //обновить экран
    }
}

exports = ClassPixelSysConf; //экспортируем класс, ВНИМАНИЕ - именно класс а не объект!