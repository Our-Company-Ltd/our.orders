import { ModelBase, Person } from '.';

export interface Client extends Person, ModelBase {
    Type: 'client';
}
