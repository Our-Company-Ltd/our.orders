import { ModelBase, ModelType } from '.';

export type DocumentTemplate = ModelBase & {
    Type: ModelType.DocumentTemplate;

    Title: string;

    Description: string;

    Template: string;

    Styles: string;

    ApplyTo: string;

};