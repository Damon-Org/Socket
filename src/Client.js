import { v4 as uuidv4 } from 'uuid'
import { OPCode } from './Constants.js'

export default class Client {
    group = null;

    /**
     *
     * @param {Main}
     * @param {net.Socket} socket
     */
    constructor(main, socket) {
        this._id = uuidv4();

        this._m = main;
        this._s = socket;
        this._s.on('close', this.onClose.bind(this));
        this._s.on('data', this.onData.bind(this));
        this._s.on('error', this.onError.bind(this));

        this.resetTimeout();
    }

    get id() {
        return this._id;
    }

    get remove() {
        return this._remove;
    }

    disconnect(reason = 'NO_REASON') {
        this.sendPayload('DISCONNECT', reason);

        this._s.destroy();

        this._m.clients.remove(this);
    }

    /**
     *
     * @param {JSON} msg
     */
    identify(msg) {
        const data = msg.data;

        if (!data.token || !data.group) return this.disconnect('IDENTIFY_FAILED');
        if (data.token !== this._m.auth.token) return this.disconnect('IDENTIFY_FAILED');

        this.group = data.group;

        this.sendPayload('IDENTIFY', { id: this.id, ping: this._m.config.ping });
    }

    /**
     *
     * @param {boolean} hadError
     */
    onClose(hadError) {
        this._m.log.warn(`CLIENT-${this.id.slice(0, 5).toUpperCase()}`, `Client disconnected, hadError?=${hadError}`);

        this._m.clients.remove(this);
    }

    /**
     *
     * @param {Buffer} data
     */
    onData(data) {
        if (data.length > (1024 * 32)) return this.disconnect('MESSAGE_TOO_BIG');
        const str = data.toString();

        try {
            this._m.router.onMessage(this, JSON.parse(str));
        } catch (error) {
            this._m.log.warn(`CLIENT-${this.id.slice(0, 5).toUpperCase()}`, 'Client message parsing error, message: ', str);
        }
    }

    /**
     *
     * @param {Error} err
     */
    onError(err) {
        this._m.log.error(`CLIENT-${this.id.slice(0, 5).toUpperCase()}`, 'Client encountered an error:', err);
    }

    ping() {
        this._remove = true;

        this.sendPayload('PING');
    }

    pong() {
        this.sendPayload('PONG');
    }

    resetTimeout() {
        /**
         * If the client is marked for removal for being idle
         * @type {boolean}
         */
        this._remove = false;
        /**
         * Last timestamp where client was known to be active
         * @type {Date.now}
         */
        this._timeout = Date.now();
    }

    /**
     * @param {JSON} data
     * @returns {boolean}
     */
    send(data) {
        if (this._s.readyState !== 'open') return false;
        if (data.op === OPCode.EVENT) data.id = uuidv4();

        this._s.write(JSON.stringify(data));

        return true;
    }

    /**
     *
     * @param {string} opcode String identifier of the OPCode to send
     * @param {string} event Friendly name for an event
     * @param {JSON} data Data to send with the event
     * @param {{
     *  target: string,
     *  identifier: string
     * }} intent Target to send this to
     */
    sendPayload(opcode, data = undefined, event = undefined, intent = undefined) {
        this.send({
            op: OPCode[opcode],
            event,
            data,
            intent
        });
    }
}
