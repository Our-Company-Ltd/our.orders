import { ModelBase, Person, ModelType } from '.';

export interface Client extends Person, ModelBase {
    Type: ModelType.Client;
}
