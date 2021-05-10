# Master Socket Server

This server is only responsible for authentication of services and sending data to clients. Any extra functionality should be implemented by the socket clients.

## Table of Contents

 - [Communication](#communication)
    - [General Formats](#general-format)
    - [OPCodes](#opcodes)
    - [Intent](#intent)
    - [Data Constraints](#data-constraints)
 - [Example](#example)

## Communication
### General Format

Most properties can be omitted while communicating with the Socket Server, `op` is the only required property, depending on which [OPCode](#opcodes) gets passed you'll have to fill other properties. I'll go over what each OPCode does further in the documentation.
```json
{
    "id": "70653cb0-5f6d-41fe-acbf-ea8f37a73034",
    "op": 0,
    "event": "EVENT_NAME",
    "data": {},
    "intent": {
        "target": "",
        "identifier": ""
    }
}
```

### OPCodes

These are to indicate to the Socket server what should be done with the message you sent, all OPCodes other than `EVENT` are for normal communication and upkeep of the socket. The event OPCode is used to communicate between different services.
```js
export const OPCode = {
    EVENT: 0,
    IDENTIFY: 1,
    DISCONNECT: 2,
    PING: 3,
    PONG: 4,
    REPLY: 5
};
```

### Intent

The intent property is used to request data from a specific group or service, the below options are valid targets.
```json
[
    "GLOBAL",
    "GROUP",
    "DIRECT"
]
```
If you've used an option other than `GLOBAL` you need to pass an additional property that identifies your target, otherwise you can omit this or pass `null`.

### Data Constraints

You're completely free to choose how your data should be formatted, as you're responsible for your events and how you format these.
 - Object
 - Array
 - Single value
 - ...

## Example

**Request:**
```json
{
    "id": "70653cb0-5f6d-41fe-acbf-ea8f37a73034",
    "op": 0,
    "event": "INFO",
    "data": {
        "requester": "a6022b4c-09b8-4f7b-8fef-c669618c7d58"
    },
    "intent": {
        "target": "GROUP",
        "identifier": "damon"
    }
}
```

**Response**
```json
{
    "id": "70653cb0-5f6d-41fe-acbf-ea8f37a73034",
    "op": 0,
    "event": "INFO",
    "data": {
        "channels": 10240,
        "shardId": "ef4d25",
        "users": 15042
    },
    "intent": {
        "target": "DIRECT",
        "identifier": "a6022b4c-09b8-4f7b-8fef-c669618c7d58"
    }
}
```
