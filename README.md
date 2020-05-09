# NodeJs Event Manager

## Basic Example

- **Initialize**

```js
import EventManager from 'nodejs-event-manager';

const myEventManager = new EventManager();

const config = {
  name: 'samsoft-topic',
  subscription: ['samsoft-email-sub', 'samsoft-blockchain-sub'],
  connectionString: ''
};

myEventManager.initialize(config);
```

- **Consumer**

```js
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
eventManager.emit(['samsoft-blockchain-sub', 'samsoft-email-sub'], {
  body: { name: 'samuel', profession: 'Software engineer' },
  source: 'azure'
});

eventManager.emit('samsoft-blockchain-sub', {
  body: { name: 'samuel', profession: 'Software engineer' }
  source: 'node'
});
```
