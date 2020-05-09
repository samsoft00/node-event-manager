export interface EventConfig {
  name: string;
  subscription: string[];
  connectionString: string;
}

export interface EmitterInterface {
  emit: Function;
  addListener: Function;
}
