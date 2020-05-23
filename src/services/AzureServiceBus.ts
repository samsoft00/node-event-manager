import { ServiceBusClient, ReceiveMode, ServiceBusMessage, TopicClient } from '@azure/service-bus';
import log from 'fancy-log';

import { camelCase } from 'lodash';
import EventResponse from '../lib/EventResponse';
import { IEmitterInterface, IEventConfig } from '../lib/interfaces';

/**
 * Azure Service bus
 */
export default class AzureServiceBus {
  serviceClient: ServiceBusClient;

  public emittery: IEmitterInterface;

  public delimiter: string;

  private topicName: string;

  connectionString: string;

  subscription: string[];

  constructor(config: IEventConfig, emittery: IEmitterInterface) {
    const { connectionString, name, delimiter, subscription } = config;

    this.connectionString = connectionString;
    this.subscription = subscription;
    this.topicName = name;
    this.delimiter = delimiter || ':';

    this.emittery = emittery;
    this.serviceClient = ServiceBusClient.createFromConnectionString(connectionString);
  }

  /**
   * Initialize services
   */
  public init() {
    this.subscription.map((subscriptionName, index) => {
      this.receiver(subscriptionName);

      this.processRetryDLQ(subscriptionName);
    });
  }

  /**
   * Receive message from both local and external
   */
  public receiver(subscriptionName: string) {
    const topicClient = this.serviceClient.createSubscriptionClient(
      this.topicName,
      subscriptionName
    );

    const receiver = topicClient.createReceiver(ReceiveMode.peekLock);

    const processMessage = async (brokeredMessage: ServiceBusMessage) => {
      const { userProperties } = brokeredMessage;

      const namespace =
        userProperties && userProperties.data
          ? [subscriptionName, userProperties.data].join(this.delimiter)
          : subscriptionName;

      this.emittery.emit({
        type: camelCase(namespace),
        result: new EventResponse({ response: brokeredMessage, error: undefined })
      });
    };

    const processError = (error: Error) => {
      log('Error occurred: ', error);
    };

    receiver.registerMessageHandler(processMessage, processError, {
      autoComplete: false
    });
  }

  /**
   * Broadcast messages to local or external events
   */
  public async sender(eventNames: string | string[], payload: any) {
    if (typeof payload !== 'object') throw new Error('Payload must be a typeOf object!');

    const topicClient = this.serviceClient.createTopicClient(this.topicName);

    const sender = topicClient.createSender();

    const listOfEvents = Array.isArray(eventNames) ? eventNames : [eventNames];
    const externalRequest: string[] = [];

    const sendEventToListener = (eventName: string) => {
      if (payload.source === 'azure') {
        externalRequest.push(eventName);
      } else {
        Object.assign(payload, {
          body: { data: { ...payload.body }, source: payload.source || 'node' },
          label: eventName
        });

        this.emittery.emit({
          type: camelCase(eventName),
          result: new EventResponse({ response: payload, error: undefined })
        });
      }
    };

    //
    listOfEvents.map((eventName: string) => sendEventToListener(eventName));

    if (externalRequest.length > 0) {
      const request = externalRequest.map((eventName, index) => {
        let userProperties;
        let subcriptionName = eventName;

        if (eventName.includes(this.delimiter)) {
          const [sub, parent, child] = eventName.split(this.delimiter);
          subcriptionName = sub;

          userProperties = { data: child ? `${parent}:${child}` : parent };
        }

        return sender.send({
          body: { data: { ...payload.body }, source: payload.source },
          label: subcriptionName,
          userProperties
        });
      });

      Promise.all(request)
        .then(() => log(`${this.constructor.name} event emitted!`))
        .catch(error => log('Error sending event!', error));
    }
    //
  }

  /**
   * Retry dead Letter Queue
   */
  public processRetryDLQ(subscribeName) {
    const deadLetterQueueName = TopicClient.getDeadLetterTopicPath(this.topicName, subscribeName);

    const queueClient = this.serviceClient.createQueueClient(deadLetterQueueName);
    const receiver = queueClient.createReceiver(ReceiveMode.peekLock);

    const processMessage = async (brokeredMessage: ServiceBusMessage) => {
      const { body, label, userProperties } = brokeredMessage;

      const namespace =
        userProperties && userProperties.data
          ? [subscribeName, userProperties.data].join(this.delimiter)
          : subscribeName;

      this.sender(namespace, { body: body.data, label, source: body.source });
      log(`Retry DLQ for ${namespace}`);

      await brokeredMessage.complete();
    };

    const processError = (error: Error) => {
      log(`RetryDLQ Error: ${error.message}`);
    };

    receiver.registerMessageHandler(processMessage, processError, {
      autoComplete: false
    });
  }

  /**
   * Close
   */
  public async close() {
    return this.serviceClient.close();
  }
}
