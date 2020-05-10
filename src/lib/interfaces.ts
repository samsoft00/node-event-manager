export interface IEventConfig {
  name: string;
  subscription: string[];
  connectionString: string;
}

export interface IEmitterInterface {
  emit: Function;
  addListener: Function;
}
