import { ModelBase, ModelType } from '.';
export type Category = ModelBase & {
    Type: ModelType.Category;
    Title: string;
};
