import net from 'net'
import Client from './Client.js'

export default class Server extends net.Server {
    constructor(main, config) {
        super();

        this.config = config;
        this._m = main;
    }

    onConnection(socket) {
        const client = new Client(this._m, socket);

        this._m.log.verbose('SOCKET', `Client "${client.id}" connected`);

        this._m.clients.add(client);
    }

    /**
     *
     * @param {Error} error
     */
    onError(error) {
        this._m.log.error('SOCKET', 'Error occurred:', error);
    }

    onListen() {
        this._m.log.info('SOCKET', `Listening on address ${this.config.host}:${this.config.port}`)
    }

    start() {
        this.on('connection', this.onConnection.bind(this));
        this.on('error', this.onError.bind(this));
        this.on('listening', this.onListen.bind(this));

        this.listen(this.config);
    }
}
