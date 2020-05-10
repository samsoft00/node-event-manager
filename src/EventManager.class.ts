/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable array-callback-return */
import { camelCase } from 'lodash';

import emittery from './lib/event';
import { IEventConfig, IEmitterInterface } from './lib/interfaces';
import AzureServiceBus from './services/AzureServiceBus';

export default class EventManager {
  private static instance: EventManager;

  private _emittery!: IEmitterInterface;

  private _serviceBus!: AzureServiceBus;

  private constructor() {}

  static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();

      EventManager.instance._emittery = emittery;
    }

    return EventManager.instance;
  }

  public initialize(config: IEventConfig) {
    this._serviceBus = new AzureServiceBus(config, this._emittery);

    config.subscription.map((subscriptionName, index) => {
      this._serviceBus?.receiver(subscriptionName);

      this._serviceBus?.processRetryDLQ(subscriptionName);
    });
  }

  public on(eventName, listener) {
    this._emittery.addListener(camelCase(eventName), listener);
  }

  public emit(eventNames: string | string[], payload: any) {
    if (!this._serviceBus) throw new Error('Event manager config error');

    this._serviceBus.sender(eventNames, payload);
  }

  async close() {
    if (this._serviceBus) {
      await this._serviceBus.close();
    }
  }
}
