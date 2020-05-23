export interface IEventConfig {
  service?: string;
  delimiter?: string;
  name: string;
  subscription: string[];
  connectionString: string;
}

export interface IEmitterInterface {
  emit: Function;
  addListener: Function;
}

export enum ServiceType {
  AZURE = 'azure',
  RABBITMQ = 'rabbitmq'
}
