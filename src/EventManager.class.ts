/* eslint-disable array-callback-return */
import { camelCase } from 'lodash';

import emittery from './lib/event';
import { IEventConfig } from './lib/interfaces';
import AzureServiceBus from './azure/AzureServiceBus';

export default class EventManager {
  private static instance: EventManager;

  serviceBus: AzureServiceBus | undefined;

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }

    return EventManager.instance;
  }

  public initialize(config: IEventConfig) {
    this.serviceBus = new AzureServiceBus(config, emittery);

    config.subscription.map((subscriptionName, index) => {
      this.serviceBus?.receiver(subscriptionName);

      this.serviceBus?.processRetryDLQ(subscriptionName);
    });

    return (req, res, next) => next();
  }

  public static on(eventName, listener) {
    emittery.addListener(camelCase(eventName), listener);
  }

  public emit(eventNames: string | string[], payload: any) {
    if (!this.serviceBus) throw new Error('Event manager config error');

    this.serviceBus.sender(eventNames, payload);
  }

  async close() {
    if (this.serviceBus) {
      await this.serviceBus.close();
    }
  }
}
