class Logger {

    static loglevelFromString(str) {
        switch (str.toUpperCase()) {
            case "DEBUG":
                return 0;
            case "INFO":
            default:
                return 1;
            case "WARN":
            case "WARNING":
                return 2;
            case "ERROR":
                return 3;
        }
    }

    constructor(level) {
        this.level = Logger.loglevelFromString(level);
    }

    debug(msg, obj=false) {
        if( this.level <= 0 ) {
            this._logMsg("DEBUG", msg, obj);
        }
    }

    info(msg, obj=false) {
        if( this.level <= 1 ) {
            this._logMsg("INFO", msg, obj);
        }
    }

    warn(msg, obj=false) {
        if( this.level <= 2 ) {
            this._logMsg("INFO", msg, obj);
        }
    }

    warning(msg, obj=false) {
        if( this.level <= 2 ) {
            this._logMsg("INFO", msg, obj);
        }
    }

    error(msg, obj=false) {
        if( this.level <= 3 ) {
            this._logMsg("INFO", msg, obj);
        }
    }

    _logMsg(level, msg, obj) {
        const t = new Date().toISOString();
        if( obj ) {
            console.info(`${t} [${level}] ${msg}`, obj);
        }
        else {
            console.info(`${t} [${level}] ${msg}`);
        }
    }
}

export default Logger;