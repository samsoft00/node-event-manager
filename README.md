# NodeJs Event Manager

### Event Manager for both internal and external events e.g Azure Service Bus, RabbitMQ, etc.

## Basic Example

- **Initialize**

```js
// For all the initializations, It can happen on app bootup like:
/* --------- File: app.js --------- */

import EventManager from 'nodejs-event-manager';

const myEventManager = EventManager.getInstance();

// Add Azure service bus credentials
const config = {
  name: 'samsoft-topic',
  subscription: ['samsoft-email-sub', 'samsoft-blockchain-sub'],
  connectionString: ''
};

myEventManager.initialize(config);
```

- **Consumer**

```js
// Note: You must listen before emitting any events

const listenEventMgr = EventManager.getInstance();

listenEventMgr.on('samsoft-email-sub', async (payload: EventResponse) => {
  console.log({ label: payload.getSource(), body: payload.getBody() });
  await payload.complete();
});

listenEventMgr.on('samsoft-email-sub:notification:send', async (payload: EventResponse) => {
  console.log({ label: payload.getSource(), body: payload.getBody() });
  await payload.complete();
});
```

- **Producer**

```js
/* --------- File user.activity.service.js --------- */
const senderMgr =  EventManager.getInstance();

// For external event, use azure or rabbitMq
senderMgr.emit(['samsoft-blockchain-sub', 'samsoft-email-sub'], {
  body: { name: 'samuel', profession: 'Software engineer' },
  source: 'azure'
});

// For internal event handle, use node as source or leave blank
senderMgr.emit('samsoft-blockchain-sub:notification:send', {
  body: { name: 'samuel', profession: 'Software engineer' }
  source: 'node'
});
```
