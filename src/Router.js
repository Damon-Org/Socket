import Redis from 'ioredis'
import { OPCode } from './Constants.js';

export default class Router {
    constructor(main) {
        this._m = main;

        this.subscriber = new Redis({
            host: this._m.auth.redis.host,
            port: this._m.auth.redis.port,
            password: this._m.auth.redis.password
        });
        this.publisher = this.subscriber.duplicate();

        this.subscriber.subscribe('message_global');
        this.subscriber.subscribe('message_group');
        this.subscriber.subscribe('message_direct');
        this.subscriber.on('message', this.onSubscriptionMessage.bind(this));
    }

    forward(message) {
        switch (message.intent.target) {
            case 'GLOBAL':
                this.publisher.publish('message_global', JSON.stringify(message));

                break;
            case 'GROUP':
                this.publisher.publish('message_group', JSON.stringify(message));

                break;
            case 'DIRECT':
                this.publisher.publish('message_direct', JSON.stringify(message));

                break;
        }
    }

    /**
     *
     * @param {Client} client
     * @param {JSON} message
     */
    onMessage(client, message) {
        switch (message.op) {
            case OPCode.EVENT:
                this.forward(message);

                break;
            case OPCode.IDENTIFY:
                client.identify(message);

                break;
            case OPCode.PING:
                client.pong();

                break;
            case OPCode.PONG:
                client.resetTimeout();

                break;
        }
    }

    /**
     *
     * @param {string} channel
     * @param {string} message
     */
    onSubscriptionMessage(channel, message) {
        try {
            const json = JSON.parse(message);

            switch (channel) {
                case 'message_global':
                    this.sendGlobal(json);

                    break;
                case 'message_group':
                    this.sendGroup(json);

                    break;
                case 'message_direct':
                    this.sendDirect(json);

                    break;
            }
        } catch (error) {}
    }

    sendDirect(message) {
        this._m.clients.get(message.intent.identifier)?.send(message);
    }

    /**
     * @param {JSON} message
     */
    sendGlobal(message) {
        this._m.clients.broadcast(message);
    }

    /**
     * @param {JSON} message
     */
    sendGroup(message) {
        this._m.clients.groups.broadcast(message.intent.identifier, message);
    }
}
