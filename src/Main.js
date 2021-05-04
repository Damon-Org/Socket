import cluster from 'cluster'
import { cpus } from 'os'
import ClientManager from './ClientManager.js'
import Router from './Router.js'
import Server from './Server.js'
import log from './util/Log.js'
import { loadJson } from './util/Util.js'

export default class Main {
    constructor() {
        this.auth = loadJson('/data/auth.json');
        this.config = loadJson('/data/config.json');

        this.log = log;
    }

    start() {
        this.log.info('MAIN', 'Starting server...');

        for (let i = 0; cluster.isMaster && i < cpus().length; i++) {
            cluster.fork();
        }

        if (cluster.isWorker) {
            this.clients = new ClientManager(this.config.ping);
            this.router = new Router(this);
            this.server = new Server(this, this.config.socket);
            this.server.start();
        }
    }

    stop() {
        this.log.info('MAIN', 'Shutting down...');

        process.exit();
    }
}
