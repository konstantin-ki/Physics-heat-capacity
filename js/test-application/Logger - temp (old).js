/**
 * Класс <AppUserError> наследует и расширяет возможности базового класса ошибок.
 * Класс добавляет поле с ошибками
 * Коды ошибок:
 * 0 - ошибка неизвестна;
 * 10 - не передан порт кнопки управления статусом SD карты
 * 11 - не передан порт светодиода индикации состояния статуса смонтирован/размонтирована SD карты
 * 12 - попытка обращения к размонтированной SD карте - > 'Error - accessing the unmounted SD'
 * 100 - код псевдошибки, используется при отсутствии ошибки для реализации логики применением исключений
 */
class AppUserError extends Error {
    constructor(_message, _code) {
        //super(_message); //наследует поле с описанием ошибки
        this.message = _message;
        this.name = "AppUserError"; //переопределяем имя типа
        this.Code = _code || 0; //поле с кодом ошибки
    }
}
/**
 * Класс ClassDefined определяет константы используемые в проекте Logger 
 */
class ClassDefined {

    /******************************КОНСТАНТЫ КЛАССА*********************************/

    //алиас - '1', 'true', 'включено'
    static get ON() {
        return 1;
    }

    //алиас - '0', 'true', 'выключено'
    static get OFF() {
        return 0;
    }

    /**
     * Константа определяющая интервал времени записи на SD карту  данных 
    */
   static get CYCLE_TIME_LOGGER(){
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
/**
 * Класс <ClassSysConf> предназначен для системных операций и контроля платформы.
 * В том числе формирует работу с системной датой
 */
class ClassSysConf {
    constructor() {
        //***************************Блок объявления полей класса****************************

        //***************************Блок инициализирующих методов конструктора***************
        E.setTimeZone(4); //установить временную зону - Самара
    }
    /**
     * Метод геттер <DateCurrent> возвращает тестовую стороку текущей Дата/Время
     */
    get DateCurrent() {
        return new Date().toString();
    }
    /**
     * Метод сеттер <DateCurrent> устанавливает текущую Дата/Время
     */
    set DateCurrent(_argVal) {
        let temp_date = (_argVal) => {
            new Date(_argVal[0], _argVal[1], _argVal[2], _argVal[3], _argVal[4], _argVal[5], 0); //инициализировать системное время

        };

        temp_date(_argVal);
    }
    /**
     * Метод геттер DateCurrentNow возвращает текущее время в миллесекундах 
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
/**
 * Класс <ClassCtrlNRF> предназначен для управления радиоинтерфейсом микропроцессора.
 * У данного модуля возникают сбои в портах цифровых шин при работе данного радиомодуля
 * это связано что работа модуля может прервать на некоторое время (по прерыванию) работу 
 * других шин как аппаратных таки программных. В форуме Гордона он сам на это указывал 
 * одному из участников, от туда я и понял проблемы которые происходили в данной программе 
 * с участком кода где происходила инициализация датчика температуры DS18B20. Его протокол
 * чувствителе к задержкам. 
 */
class ClassCtrlNRF {
    constructor(_buttonPort, _ledPort) {

        this.ButtonNRF = _buttonPort; // поле алиас порта на который повешена кнопка управления интерфейсом NRF
        this.LedModeNRF = _ledPort; //поле алиас порта на который повещен светодиод режима NRF
        this.TimeCyclePulseOFF = 900; //длительность ms выключенного состояния LED кнопки
        this.TimeCyclePulseON = 100; //длительность ms выключенного состояния LED кнопки

        this.FlagWorksNRF = true; //поле-флаг управление NRF интерфейсом, исх состояние BLE => работает

        //***************************Блок инициализирующих методов конструктора***************
        //digitalWrite(this.LedModeNRF, 1); //включить светодиод => BLE работает
        this.StatusNRFLEDPulse();
    }
    /**
     * Метод <SleepNRF> отправляет BLE интерфейс в sleep режим и выполняет сопутствующие действия
     */
    SleepNRF() {

        NRF.sleep(); //отключить BLE интерфейс
        this.FlagWorksNRF = false; //поле-флаг управление NRF интерфейсом установить в <false>
        //digitalWrite(this.LedModeNRF, 0); //выключить светодиод => BLE выключен
    }
    /**
     * Метод <WakeNRF> активирует BLE интерфейс и выполняет сопутствующие действия
     */
    WakeNRF() {

        NRF.wake(); //включить BLE интерфейс
        this.FlagWorksNRF = true; //поле-флаг управление NRF интерфейсом установить в <true>
        //digitalWrite(this.LedModeNRF, 1); //выключить светодиод => BLE работает
    }
    /*
     *	Метод <OnOffNRF> отправляет в спячку NRF интерфейс или пробуждает его.
     *	Опирается на поле класса <FlagWorksNRF> - определяет режим
     *	NRF sleep (false) или пробуждение wake (true)
     */
    OnOffNRF() {
        if (this.FlagWorksNRF) {

            NRF.sleep(); //отключить работу BLE
            //digitalWrite(this.LedModeNRF, 0); //выключить светодиод
        } else {
            NRF.wake(); //включить работу BLE
            //digitalWrite(this.LedModeNRF, 1); //включить светодиод
        }
        this.FlagWorksNRF = !this.FlagWorksNRF; //инвертировать флаг
    }
    /*
     *	Мониторинг кнопки управляющей режимом работы NRF/BLE
     */
    MonitorButton() {
        setWatch(this.OnOffNRF.bind(this), this.ButtonNRF, {
            edge: "falling",
            debounce: 50,
            repeat: true
        }); //срабатывает по отпусканию кнопки
    }
    /**
     * Метод управляет сигнализацией состояния статуса BLE интерфейса
     */
    StatusNRFLEDPulse() {
        setTimeout(() => {
            if (this.FlagWorksNRF) {
                analogWrite(this.LedModeNRF, 0.1, {
                    freq: 100
                });
                setTimeout(() => {
                    analogWrite(this.LedModeNRF, 0, {
                        freq: 100
                    });
                    this.StatusNRFLEDPulse();
                }, this.TimeCyclePulseON);
            } else {
                analogWrite(this.LedModeNRF, 0, {
                    freq: 100
                }); //выключить пульсацию светодиода
                this.StatusNRFLEDPulse();
            }
        }, this.TimeCyclePulseOFF);
    }

}
/**
 * Класс реализует базовые операции по созданию "софтверной" SPI шины
 */
class ClassBaseSPIBus {
    constructor() {
        this.SPIbus = []; //массив объектов-шин SPI
    }
    /**
     * 
     */
    InitBus(_mosi, _miso, _sck) {
        let opt = { //создать временный объект с параметрашим создаваемой шины
            mosi: _mosi,
            miso: _miso,
            sck: _sck
        };

        this.SPIbus.push(new SPI()); //создать шину
        this.SPIbus[this.SPIbus.length - 1].setup(opt); //инициализировать созданную шину
        /*DEBUG*/console.log(`DEBUG-> Create soft SPI bus. Index SPI soft bus: ${this.SPIbus.length - 1}`); //DEBUG
        return this.SPIbus[this.SPIbus.length - 1]; //вернуть объект SPI созданной шины 
    }
}
/**
 * Класс <ClassBaseSDcard> реализует базовые операции с SD картой
 */
class ClassBaseSDcard {
    constructor(_spiBus, _csPin, _butInd, _ledInd) {
        //***************************Блок объявления полей класса****************************
        this.SD = {
            SPIbus: _spiBus,
            CSpin: _csPin
        };
        this.StatusButton = _butInd;
        this.StatusInd = _ledInd;
        this._FlagStatusSD = false; //флаг характеризующий состояние SD карты mount/unmount

        //***************************Блок инициализирующих методов конструктора***************
        this.ConnectSD(); //смонтировать SD карту
        this.CompleteWorkSD(); //запустить мониторинг кнопки управления статусом SD карты (смонтирована/размонтирована)
    }
    /**
     * 
     */
    get FlagStatusSD() {
        return this._FlagStatusSD;
    }
    /**
     * 
     */
    set FlagStatusSD(_flag) {
        this._FlagStatusSD = _flag;
    }
    /***
     * Метод "монтирует" карту SD и подключает к заданной SPI шине
     */
    ConnectSD() {
        E.connectSDCard(this.SD.SPIbus, this.SD.CSpin);
        this.FlagStatusSD = true;//карта смонтирована
        /*DEBUG*/console.log(`DEBUG-> SD card mount`); //DEBUG
        /*DEBUG*/Terminal.println(`SD card mount`);
    }
    /**
     * Метод "размонтирует" карту SD, готовя ее к извлечению
     */
    DisconnectSD() {
        E.unmountSD();
        digitalWrite(this.StatusInd, 1); //включить светодиод сигнализирующий о размонтировании SD карты
        this.FlagStatusSD = false; //карта размонтирована
        /*DEBUG*/console.log(`DEBUG-> SD card unmount`);
        /*DEBUG*/Terminal.println(`SD card umount`);  //DEBUG
    }
    /**
     * Метод позволяет размонтировать карту в ручном режиме, нажав кнопку.
     * Для работы необходимо передать порт на котором работает кнопка
     */
    CompleteWorkSD() {
        //размонтировать SD карту при нажатии кнопки, срабатывает по отпусканию
        setWatch(this.DisconnectSD.bind(this), this.StatusButton, {
            edge: "falling",
            debounce: 50,
            repeat: true
        });
    }
    
    /**
     * Метод <ViewListFiles> перенести в класс ClassBaseSDcard
     */
    ViewListFiles() {
        if (this.FlagStatusSD) {
            console.log(this.FS.readdirSync()); //вывести список файлов в консоль
        } else {
            throw new AppUserError('Error - accessing the unmounted SD', 12); //выбросить исключение, SD карта размонтирована
        }
    }
}
/**
 * Класс <ClassLogger> является классом верхнего уровня по ерализации логгера температуры
 * и сопутствующих параметров.
 * <ClassLogger> - наследует от класса <ClassBaseSDcard>
 * В классе определены важнейшие параметры протоколирования температуры и других параметров
 * на SD карте.
 */
class ClassLogger extends ClassBaseSDcard {
    constructor(_spiBus, _csPin, _butInd, _ledInd, _sensTemp, _cycleLogger) {
        super(_spiBus, _csPin, _butInd, _ledInd);

        this.SensTemp = _sensTemp; //присвоить объект предоставляющий данные о температуре
        this.FS = require("fs"); //подключить библиотеку работы с файлами
        this.IdTimerLogger = undefined; //указатель на таймер периодической ф-и записи данных
        this.CycleTimeLogger = _cycleLogger || 1000; //время периода записи данных на SD карту
        this.FixedTemp = 3; //ограничитель разряда температуры сохраняемой на SD карту
    }

    /**
     * 
     */
    Logger() {
        if (this.FlagStatusSD) {
            let date = new Date(); //получить объект хранящий timestamp
            let csv_str = date.getFullYear().toString() +
                '.' +
                date.getMonth().toString() +
                '.' +
                date.getDate().toString() +
                ';' +
                date.getHours() +
                ':' +
                date.getMinutes() +
                ':' +
                date.getSeconds() +
                ';' +
                this.SensTemp.CurTemp.toFixed(this.FixedTemp) +
                ';' +
                '\n'; //получить полный год
            this.FS.appendFileSync('Data.csv', csv_str);
        } else {
            clearTimeout(this.IdTimerLogger); //прекратить запись данных т.к. SD карта размонтирована
        }
    }
    /**
     * 
     */
    LoggerCycleBind() {
        this.IdTimerLogger = setInterval(this.Logger.bind(this), this.CycleTimeLogger); //запустить циклическую запись данных на SD карту

    }
}
/***
 * Класс реализует базовые операции с датчиком температуры DS18B20, используя библиотеку-драйвер
 * Передаваемые параметры:
 * _owPort      - экземпляр шины OneWire
 * _sensRes     - разрешающая способность датчика, целое число от 9 до 11 
 * 
 */
class ClassBaseTempeature {
    /******************************КОНСТАНТЫ КЛАССА*********************************/

    constructor(_owPort, _sensRes, _cycleTime) {

        this.OW = new OneWire(_owPort); //создать программную шину OneWire для температурного датчика {D0}
        this.DS18B20 = undefined; //это поле будет хранить экземпляр первого объекта-драйвера датчика DS18B20
        this.Resolution = _sensRes; //задать разрешение датчика по температуре {10}        
        this.FlagTempInit = false; //флаг характеризует успех/неудачу инициализации датчика температуры true/false успешно/не успешно
        this._FlagFinalInitDS18B20 = false; //флаг окончания процедуры инициализации
        this.TimeCycleReInit = 20; //время в ms повторной инициализации датчика DS18B20        

        this.CycleTimeReadTemp = _cycleTime || 1000; //задать период в ms считывания показания температуры термо-датчика {1000}
        this.IdTimerTemp = undefined; //id таймера на считыание температуры

        this._CurTemp = 0; //хранит текущую температуру полученную от датчика
    }

    //Метод эмулирует константу, равную максимальному количеству попыток инициализации датчика DS18B20
    get COUNT_INIT_MAX() {
        return 20;
    }
    /**
     * Методы для работы с флагом который хранит состояние 
     */
    get FlagFinalInitDS18B20() {
        return this._FlagFinalInitDS18B20; //вернуть значение флага
    }
    set FlagFinalInitDS18B20(_flag) {
        this._FlagFinalInitDS18B20 = _flag;
    }
    /**
     * Сеттер и геттер поля текущей температуры
     */
    get CurTemp() {
        return this._CurTemp;
    }
    set CurTemp(_temp) {
        this._CurTemp = _temp;
    }
    /**
     * 
     * 
     */
    InitDS18B20() {
        //const init_ds18b20 = (ms) =>  {return new Promise((resolve) => setTimeout(resolve, ms));};

        const init_ds18b20 = () => {
            //*DEBUG*/console.log(`Function init_ds18b20 create...`); //DEBUG
            // проверяем создание статической переменной функции
            if (typeof (init_ds18b20.static_counter_init) === 'undefined') {
                // если нет ставим в ноль
                init_ds18b20.static_counter_init = 0;
                //*DEBUG*/console.log(`Static var create static_counter_init: ${init_ds18b20.static_counter_init} `) //DEBUG
            }
            if (!this.FlagTempInit) {
                //*DEBUG*/console.log(`One if proiden...`);
                if (init_ds18b20.static_counter_init < this.COUNT_INIT_MAX) {
                    //*DEBUG*/ console.log(`Two if proiden...`);
                    setTimeout(() => {
                        Terminal.println(`N${init_ds18b20.static_counter_init+1} - attempt create driver...`);
                        try {
                            this.DS18B20 = require("DS18B20").connect(this.OW); //подключаемся к первому датчику температуры DS18B20}
                        } catch (error) {
                            //если инициализация завершилась неудачей                   
                            Terminal.println(`N${init_ds18b20.static_counter_init+1} - error ` + error.message);
                            Terminal.println('##########');
                            console.log(`N${init_ds18b20.static_counter_init+1} - catch error ` + error.message); //DEBUG

                            ++init_ds18b20.static_counter_init; //увеличить счетчик попыток
                            init_ds18b20();
                        }
                        this.FlagTempInit = true; //датчик температуры инициализирован
                        this.FlagFinalInitDS18B20 = true; //установить флаг завершения инициализации

                        Terminal.println(`N${init_ds18b20.static_counter_init+1} - Create driver successfully !`);
                        Terminal.println('##########');
                    }, this.TimeCycleReInit);
                } else {
                    Terminal.println(' ');
                    Terminal.println('DS18B20 INIT CRASH !');
                }
            }
        };
        //*DEBUG*/console.log(`Start init_ds18b20 function...`); //DEBUGs
        init_ds18b20(); //запускаем функцию  
    }
    /**
     *
    */
    ReadTemp() {
        let temp_data = this.DS18B20.getTemp(); //считать температуру

        //Если при считывании температуры будет выявлена ошибка CRC, библиотека датчика
        //вернет значение null. В этом случае метод заместит текущее считанное значение
        //считанным на прошлой итерации 
        this.CurTemp = (temp_data === null) ? this.CurTemp : temp_data; //записать значение, если получили корректные данные
        /*DEBUG*/this.CurTemp =  (temp_data === null) ? 0 : temp_data;
        //*DEBUG*/console.log(`New measurement temp : ${temp_data}`);
    }

    /**
     * Bind версия типа Bind, чтения данных температуры с первого датчика DS18B20
     */
    ReadTempCycleBind() {
        this.IdTimerTemp = setInterval(this.ReadTemp.bind(this), this.CycleTimeReadTemp); //запускаем циклическое считываение показаний датчика
    }
}
/*
 *
 */
class ClassRun {
    constructor(_objSys, _objCtrlNRF, _objReadTemp, _objLogger, _timeCyclePrint) {
        this.ObjSys = _objSys; //присвоить полю объект управляющий системными установками
        this.ObjCtrlNRF = _objCtrlNRF; //присвоить полю объект управления NRF интерфейсом
        this.ObjReadTemp = _objReadTemp; //присвоить объект предоставляющий данные о температуре
        this.ObjLogger = _objLogger; //присвоить объект логгер (выполняющий периодическую запись данных на SD карту)

        this.TimeCyclePrint = _timeCyclePrint; //период в ms вывода показаний температуры
        this.IdTimerPrint = undefined; //id таймера на вывод данных на LCD

        this.FixedTemp = 3; //присвоить ограничитель количества выводимых разрядов, данных температуры
    }

    /**
     * Метод обеспечивает вывод данных на LCD экран в терминальном режиме
     */
    PrintTempLCD() {
        IdTimerPrint = setInterval(() => { //запустить переодический вывод данных температуры на LCD
                let str_curtemp = this.ObjReadTemp.CurTemp.toFixed(this.FixedTemp); //получить и отформатировать текущую температуру
                let str_temp_1 = 'Temp value : ';
                let str_temp_2 = ' C';
                let str_result = str_temp_1 + str_curtemp + str_temp_2;
                Terminal.println(str_result); /*вывести данные температуры на LCD*/
            },
            this.TimeCyclePrint);
    }
    /**
     * Основной инициализирующий метод класса
     */
    Init() {
        this.ObjSys.ClearLCD(); //очистить LCD
        //*DEBUG - выключено для долговременных экспериментов*/ ClassDefined.LCD_LIGH_ON(); //включить подсветку дисплея
        ClassDefined.LCD_LIGH_OFF();
        Terminal.println('START PROGRAMM');

        this.ObjCtrlNRF.MonitorButton(); //запустить мониторинг кнопки управления режимом BLE //DEBUG
    }
    /*
     *	Метод класс выполняет основную бизнес-логику программы
     */
    Run() {

        if (this.ObjReadTemp.FlagTempInit) {
            this.ObjReadTemp.DS18B20.setRes(this.ObjReadTemp.Resolution); //установить точность преобразования температуры
            this.ObjReadTemp.ReadTempCycleBind(); //запустить циклическое считывание температуры
            this.PrintTempLCD(); //запустить циклическое отображение данных температуры на LCD
            this.ObjLogger.LoggerCycleBind(); //запустить циклическую запись данных температуры на SD карту
        } else {
            Terminal.println(' ');
            Terminal.println('DS18B20 INIT CRASH !');
        }

    }
    /**
     * 
     */
    Start() {
        this.Init(); //инициализируем систему

        const check_init = () => { //реализация ожидания окончания инициализации датчиков температуры
            if (!this.ObjReadTemp.FlagFinalInitDS18B20) {
                setTimeout(() => {
                    /*DEBUG*/console.log('***check_init run...'); //DEBUG
                    check_init();
                }, 65);
            } else {
                this.Run(); //запускаем систему в автоматическом режиме
            }
        };
        check_init(); //запускаем функцию
    }
}

/*******************************************************************************************************************/
/**********************************************СЕКЦИЯ СОЗДАНИЯ ЭКЗЕМПЛЯРОВ КЛАССОВ**********************************/

let SysConf = new ClassSysConf(); //объект управляющий системными настройками
let CtrlNRF = new ClassCtrlNRF(D11, A3 /*_buttonPort, _ledPort*/ ); //объект управляющий режимом NRF/BLE посредством кнопки
let SPIarr = new ClassBaseSPIBus(); //создать объект-хранилище SPI шин (программная реализация)
let SPI4 = SPIarr.InitBus(D7, D2, A5); //инициализировать шину SPI
let ReadTemp = new ClassBaseTempeature(D0, 12, 10000 /*_owPort, _sensRes, _cycleTime*/ ); //объект-драйвер датчика DS18B20
let Logger = new ClassLogger(SPI4, A4, D12, A1, ReadTemp, 300000); //объект выполняющий периодическую запись данных на SD карту
let Run = new ClassRun(SysConf, CtrlNRF, ReadTemp, Logger, 300000);


/*******************************************************************************************************************/
/**********************************************RUN секция программы*************************************************/
ReadTemp.InitDS18B20(); //инициализировать датчик температуры DS18B20
//*DEBUG*/Logger.ViewListFiles(); //DEBUG -> вывести список файлов SD карты
Run.Start(); //запускаем систему