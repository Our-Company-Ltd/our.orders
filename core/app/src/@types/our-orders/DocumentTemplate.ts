import { ModelBase } from '.';

export type DocumentTemplate = ModelBase & {
    Type: 'documenttemplate';

    Title: string;

    Description: string;

    Template: string;

    Styles: string;

    ApplyTo: string;

};