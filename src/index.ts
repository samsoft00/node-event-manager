import EventManager from './EventManager.class';
import EventResponse from './lib/EventResponse';

export { EventManager, EventResponse };

/*
Example

const config = {
  name: 'samsoft-topic',
  subscription: ['samsoft-email-sub', 'samsoft-blockchain-sub'],
  connectionString:
    'Endpoint=sb://testsamsoft.servicebus.windows.net/;SharedAccessKeyName=manage-topic;SharedAccessKey=lLlvctkuTGV6BEaAKzQgdhvHA8iPkxfjwY6Iwl4xv9U=;EntityPath=samsoft-topic'
};

const eventManager = new EventManager();
eventManager.initialize(config);

EventManager.on('samsoft-email-sub', async (payload: EventResponse) => {
  console.log({ label: payload.getSource(), body: payload.getBody() });
  await payload.complete();
});

EventManager.on('samsoft-blockchain-sub', async (payload: EventResponse) => {
  console.log({ label: payload.getSource(), body: payload.getBody() });
  await payload.complete();
});

// eventManager.emit(['samsoft-blockchain-sub'], {
//   body: { name: 'samuel', profession: 'Software engineer' },
//   source: 'azure'
// });
eventManager.emit('samsoft-blockchain-sub', {
  body: { name: 'samuel', profession: 'Software engineer' }
  //   source: 'azure'
});
*/
