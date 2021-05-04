import fs from 'fs'
import util from 'util'

const levelTypes = ['VERBOSE', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
const logColors = {
    'VERBOSE': ['\x1b[34m', '\x1b[0m'],
    'INFO': ['\x1b[32m', '\x1b[0m'],
    'WARNING': ['\x1b[33m', '\x1b[0m'],
    'ERROR': ['\x1b[31m', '\x1b[0m'],
    'CRITICAL': ['\x1b[31m', '\x1b[0m']
};

export default class log {
    _logLevel = 'INFO';
    constructor() {}

    /**
     * @param {String} level The level of logging to be used
     * @param {String} name The informative name from where the log came
     * @param {String} message
     * @param {*} [data=null] This can be anything that you want to add to the log
     * @param {Boolean} [show_time=true] If the time of the log should be added with the log
     */
    static _log(level, name, message, data = null, show_time = true) {
        level = level.toUpperCase();

        if (!levelTypes.includes(level)) throw new TypeError('Invalid logging level used!');

        if (levelTypes.indexOf(this._logLevel) <= levelTypes.indexOf(level)) {

            let log = show_time ? `[${new Date().toLocaleTimeString()}] ` : '';

            const colors = logColors[level];

            let msg = `${log}${colors[0]}[${name.toUpperCase()}/${level}]${colors[1]} ${message}`;

            console.log(msg);
            if (data) console.log(data);

            if (level != 'VERBOSE') {
                const date = new Date();

                msg = `${log}[${name.toUpperCase()}/${level}] ${message}`;
                if (data) message += `\n${util.format(data)}`;

                fs.appendFile(
                    `${process.cwd()}/log/${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}-${level.toLowerCase()}.log`,
                    message + '\n',
                    (err) => {
                        if (err) throw err;
                    }
                );
            }
        }
    }

    static setLogLevel(level){
        level = level.toUpperCase();
        if (!levelTypes.includes(level)) {
            this._logLevel = level
        }
        else {
            throw new TypeError('Invalid logging level used!');
        }

    }

    static critical(...args) {
        log._log('critical', ...args);
    }

    static error(...args) {
        log._log('error', ...args);
    }

    static info(...args) {
        log._log('info', ...args);
    }

    static verbose(...args) {
        log._log('verbose', ...args);
    }

    static warn(...args) {
        log._log('warning', ...args);
    }
}
