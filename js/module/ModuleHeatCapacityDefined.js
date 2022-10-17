/**
 * @class
 * Класс ClassDefined определяет константы используемые в проекте Logger 
 */
class ClassDefined {

    /******************************КОНСТАНТЫ КЛАССА*********************************/

    //алиас - '1', 'true', 'включено'
    static get ON() {
        return 1;
    }

    //алиас - '0', 'false', 'выключено'
    static get OFF() {
        return 0;
    }

    /**
     * Константа определяющая интервал времени записи на SD карту  данных 
     */
    static get CYCLE_TIME_LOGGER() {
        return 20000; // 20 - секунд
    }
    /**
     * Статический метод включающий подсветку LCD модуля Pixl.js
     */
    static LCD_LIGH_ON() {
        LED1.write(ClassDefined.ON);
    }

    /**
     * Статический метод выключающий подсветку LCD модуля Pixl.js
     */
    static LCD_LIGH_OFF() {
        LED1.write(ClassDefined.OFF);
    }
}