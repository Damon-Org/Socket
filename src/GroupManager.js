export default class GroupManager extends Map {
    constructor() {
        super();
    }

    /**
     *
     * @param {string} group Group identifier
     * @param {Client} client The client instance
     */
    add(group, client) {
        if (!this.has(group)) this.set(group, new Map());

        group = this.get(group);
        group.set(client.id, client);
    }

    broadcast(group, message) {
        if (!this.has(group)) return;

        group = this.get(group);
        for (const client of group.values()) {
            client.send(message);
        }
    }

    /**
     *
     * @param {Client} client The client instance
     * @returns {boolean} True if the client or group was removed, false otherwise
     */
    remove(client) {
        if (!this.has(client.group)) return false;

        const group = this.get(client.group);
        if (group.size == 1) return this.delete(client.group);

        return group.delete(client.id);
    }
}
