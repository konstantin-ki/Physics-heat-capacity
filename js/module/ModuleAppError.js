class ClassAppError {
    constructor(_message, _code) {
        this.name = 'ClassAppError'; 
        this._Message = _message;
        this._Code = _code || 1; 
    }
    get Message() {return this._Message;}
    get Code() {return this._Code;}
}

exports = ClassAppError;