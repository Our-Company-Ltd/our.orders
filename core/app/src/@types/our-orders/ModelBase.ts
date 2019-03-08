import { ModelType } from '.';

export type ModelBase = {
    Type: ModelType;
    Id: string;
    LastMod?: string;
    Creation?: string;
};
