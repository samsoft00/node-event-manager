# NodeJs Event Manager

## Basic Example

- **Initialize**

```js
// For all the initializations, It can happen on app bootup like:
/* --------- File: app.js --------- */

import EventManager from 'nodejs-event-manager';

const myEventManager = new EventManager();

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

EventManager.on('samsoft-email-sub', async (payload: EventResponse) => {
  console.log({ label: payload.getSource(), body: payload.getBody() });
  await payload.complete();
});

EventManager.on('samsoft-blockchain-sub', async (payload: EventResponse) => {
  console.log({ label: payload.getSource(), body: payload.getBody() });
  await payload.complete();
});
```

- **Producer**

```js
/* --------- File user.activity.service.js --------- */
const eventManager =  EventManager.getInstance();

eventManager.emit(['samsoft-blockchain-sub', 'samsoft-email-sub'], {
  body: { name: 'samuel', profession: 'Software engineer' },
  source: 'azure'
});

eventManager.emit('samsoft-blockchain-sub', {
  body: { name: 'samuel', profession: 'Software engineer' }
  source: 'node'
});
```
