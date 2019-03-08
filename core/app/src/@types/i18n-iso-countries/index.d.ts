declare module 'i18n-iso-countries' {

    type CountriesType = {
        // Get the name of a country by it's ISO 3166-1 Alpha-2, Alpha-3 or Numeric code
        getName(code: string, lang: string): string;
        // Get all names by their ISO 3166-1 Alpha-2 code
        getNames(lang: string): { [code: string]: string };

        registerLocale(locale: any): void;
    };
    const Countries: CountriesType;
    export default Countries;

}
// declare module "i18n-iso-countries/langs/en" {
//     const data: any;
//     export = data;
// }

// declare module "i18n-iso-countries/langs/de" {
//     const data: any;
//     export = data;
// }