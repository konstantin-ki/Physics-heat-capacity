/*
 *
 */
class ClassRun {
    constructor(_objSys, _objCtrlNRF, _objReadTemp, _objLogger, _timeCyclePrint) {
        this.ObjSys = _objSys; //присвоить полю объект управляющий системными установками
        this.ObjCtrlNRF = _objCtrlNRF; //присвоить полю объект управления NRF интерфейсом
        this.ObjReadTemp = _objReadTemp; //присвоить объект предоставляющий данные о температуре
        this.ObjLogger = _objLogger; //присвоить объект логгер (выполняющий периодическую запись данных на SD карту)

        this.TimeCyclePrint = _timeCyclePrint; //период в ms вывода показаний температуры на {1000}
        this.IdTimerPrint = undefined; //id таймера на вывод данных на LCD

        this.FixedTemp = 2; //присвоить ограничитель количества выводимых разрядов, данных температуры
    }

    /**
     * Метод обеспечивает вывод данных на LCD экран в терминальном режиме
     */
    PrintTempLCD() {
        IdTimerPrint = setInterval(() => { //запустить переодический вывод данных температуры на LCD
                let str_curtemp = this.ObjReadTemp.CurTemp.toFixed(this.FixedTemp); //получить и отформатировать текущую температуру
                let str_temp_1 = 'Temp air :';
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
        ClassDefined.LCD_LIGH_ON(); //включить подсветку дисплея
        Terminal.println('START PROGRAMM');

        this.ObjCtrlNRF.MonitorButton(); //запустить мониторинг кнопки управления режимом BLE //DEBUG
    }
    /*
     *	Метод класа выполняет основную бизнес-логику программы
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

        const check_init = () => { //реализации ожидания окончания инициализации датчиков темературы
            if (!this.ObjReadTemp.FlagFinalInitDS18B20) {
                setTimeout(() => {
                    /*DEBUG*/
                    console.log('***check_init run...'); //DEBUG
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
//let SD          = new ClassBaseSDcard(SPI4, A2, D12, A1); //создать объект для работы с SD картой
//SD.CompleteWorkSD(D12); //запускаем отслеживание кнопки управления ручного размонтирования SD карты
let ReadTemp = new ClassBaseTempeature(D0, 10, 1000 /*_owPort, _sensRes, _cycleTime*/ ); //объект-драйвер датчика DS18B20
let Logger = new ClassLogger(SPI4, A4, D12, A1, ReadTemp); //объект выполняющий периодическую запись данных на SD карту
let Run = new ClassRun(SysConf, CtrlNRF, ReadTemp, Logger, 1000);


/*******************************************************************************************************************/
/**********************************************RUN секция програмы*************************************************/
ReadTemp.InitDS18B20(); //инициализировать датчик температуры DS18B20
//*DEBUG*/Logger.ViewListFiles(); //DEBUG -> вывести список файлов SD карты

Run.Start(); //запускаем систему