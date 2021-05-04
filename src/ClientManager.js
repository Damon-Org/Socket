import GroupManager from './GroupManager.js'

export default class ClientManager {
    /**
     *
     * @param {number} ping Time in ms for clients to get pinged
     */
    constructor(ping) {
        this.clients = new Map();
        this.groups = new GroupManager();

        setInterval(this.pingClients.bind(this), ping);
    }

    add(client) {
        this.clients.set(client.id, client);
    }

    broadcast(data) {
        for (const client of this.clients.values()) {
            client.send(data);
        }
    }

    get(clientId) {
        return this.clients.get(clientId);
    }

    pingClients() {
        for (const client of this.clients.values()) {
            if (client.remove) client.disconnect('PING_TIMEOUT');
            else client.ping();
        }
    }

    remove(client) {
        this.clients.delete(client.id);
        this.groups.remove(client);
    }
}
