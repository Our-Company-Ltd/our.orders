export type LocaleState = {
    lang: string;
    loading: boolean;
    messages?: { [id: string]: string };
};