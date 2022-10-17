/**
 * @class
 * ClassBaseOneWire реализует базовые операции по созданию общего для проекта хранилища
 * объектов OneWire (OW)шин.
 * Задачи класса динамически создавать и добавлять в контейнер новый объект OW шины и предоставлять
 * прикладным классам экземпляры объектов, а также хранить информацию о том - используется данная,
 * шина или нет. В отличие от хранилища OW  шин, OW могут быть совместно использованы, поэтому 
 * Класс содержит методы для создания объектов типа OW  шина.
 * Класс реализует паттерн - синглтон, т.е. экземпляр класса может быть только один.
 */
class ClassBaseOneWire {
/**
 * @constructor
 */
    constructor(){
        this.Instance = null; //поле на основе которого реализуется синглтон
         this.OWbus = {}; //контейнер объектов-шин OW
         //пример записи OWbus поля OWbus.OW1 ={IDbus: new OneWire(), Used: true};
         
         this.Pattern = 'OW'; //базовая часть всех ключей объектов-шин OW, полное название получается конкатенацией с текущим индексом
         this.IndexBus = 1; //начальный индекс OW шин, полный индекс будет вида OW11, OW12, OW13 и т.д.
        
         //реализация паттерна синглтон
        if (this.Instance) {
            return this.Instance;
        } else {
            ClassBaseOneWire.prototype.Instance = this;
        }
    }
    /**
     * @const
     * @type {number}
     * Константа ERROR_CODE_OW_PIN_NOT_EXISTING определяет КОД ошибки, которая может
     * произойти в случае если для создания OW шины были переданы не существующие порты
     * или не были переданы вовсе.
     * микроконтроллера, или занятые другими объектами
     */
    static get ERROR_CODE_OW_PIN_NOT_EXISTING() { return 20;}
    /**
     * @const
     * @type {string}
     * Константа ERROR_MSG_OW_PIN_NOT_EXISTING определяет СООБЩЕНИЕ ошибки, которая может
     * произойти в случае если для создания OW шины были переданы не существующие порты
     * микроконтроллера, или занятые другими объектами
     */
    static get ERROR_MSG_OW_PIN_NOT_EXISTING() { return 'Error -> The OW pin not existing'; }
   /**
    * @method
    * Метод AddBus создает объект экземпляр класса OW, как soft реализацию OW шины.
    * Методу передается в качестве аргумента объект с параметрами создаваемой шины.
    * @param {ObjectOWBusParam}   _opt        1 - объект с параметрами шины OW
    * @returns {Object}           _retVal     1 - возвращаемый объект вида:
    *                                          { NameBus: bus_name, //имя созданной шины
    *                                            IDbus:   this.OWbus.bus_name.IDbus //объект шины OW
    *                                          }
    */
    AddBus( _opt){
        /* данную конструкцию конструкцию расскоментировать в случае скачивания проекта с гитхаба, в таком случае
           локальна библиотека будет недоступна*/
        //const ClassErrorAppUser = require('https://github.com/konstantin-ki/Physics-heat-capacity/blob/main/js/module/ModuleAppError.js'); //импортируем прикладной класс ошибок
        const ClassErrorAppUser = require('ModuleAppError');
        
        /*проверить переданные параметры шины на валидность*/
        if ( !(_opt.OWpin instanceof Pin) ) {
            throw new ClassErrorAppUser(ClassBaseOneWire.ERROR_MSG_OW_PIN_NOT_EXISTING,
                                        ClassBaseOneWire.ERROR_CODE_OW_PIN_NOT_EXISTING);
        }
        /*все необходимые для создания шины параметры переданы -> создать и инициализировать новую шину*/
        let bus_name = this.Pattern + this.IndexBus; //полное имя ключа текущей шины
        
        this.OWbus.bus_name = {
            IDbus: new OneWire(_opt.OWpin), //сгенерировать шину
            Used: true //индикатор использования шины в true
        };        
        ++this.IndexBus; //увеличить индекс шины
        
        return {
                NameBus: bus_name, //имя созданной шины
                IDbus:   this.OWbus.bus_name.IDbus //объект шина OW
            };
    }
}
exports = ClassBaseOneWire; //экспортируем класс, ВНИМАНИЕ - именно класс а не объект!