/**
 * Класс ClassCtrlNRF предназначен для управления радиоинтерфейсом микропроцессора.
 * У данного модуля возникают сбои в портах цифровых шин при работе данного радиомодуля
 * это связано что работа модуля может прервать на некоторое время (по прерыванию) работу 
 * других шин как аппаратных таки программных. В форуме Гордона он сам на это указывал 
 * одному из участников, от туда я и понял проблемы которые происходили в данной программе 
 * с участком кода где происходила инициализация датчика температуры DS18B20. Его протокол
 * чувствителен к задержкам. 
 */
class ClassPixelNRFmanagement {
    constructor(_buttonPort, _ledPort) {

        this.ButtonNRF = _buttonPort; // поле алиас порта на который повешена кнопка управления интерфейсом NRF
        this.LedModeNRF = _ledPort; //поле алиас порта на который повещен светодиод режима NRF
        this.TimeCyclePulseOFF = 900; //цикл ms пульсации светодиодом, указан длительность выключенного состояния LED кнопки
        this.TimeCyclePulseON = 100; //цикл ms пульсации светодиодом, указан длительность выключенного состояния LED кнопки

        this.FlagWorksNRF = true; //поле-флаг управление NRF интерфейсом, исх состояние BLE => работает

        //***************************Блок инициализирующих методов конструктора***************
        //this.StatusNRFLEDPulse();
    }
    /**
     * Метод отправляет BLE интерфейс в sleep режим и выполняет сопутствующие действия
     */
    SleepNRF() {

        NRF.sleep(); //отключить BLE интерфейс
        this.FlagWorksNRF = false; //поле-флаг управление NRF интерфейсом установить в <false>
    }
    /**
     * Метод <WakeNRF> активирует BLE интерфейс и выполняет сопутствующие действия
     */
    WakeNRF() {
        NRF.wake(); //включить BLE интерфейс
        this.FlagWorksNRF = true; //поле-флаг управление NRF интерфейсом установить в <true>
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

exports = ClassPixelNRFmanagement; //экспортируем класс, ВНИМАНИЕ - именно класс а не объект!