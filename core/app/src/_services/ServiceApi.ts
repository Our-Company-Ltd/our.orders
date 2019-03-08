import { config, handleApiResponse, addAuthHeader } from '../_helpers';

import {
    ModelBase,
    ModelType,
    FindResult,
    Order,
    Shop,
    Warehouse,
    User,
    OrderItem,
    TimeInterval,
    Product,
    ShippingTemplate,
    Client,
    Movement,
    Cashbox,
    StockUnit,
    ProductSelection,
    StatisticReport,
    Setting,
    Category,
    ProductPreview,
    Voucher,
    DocumentTemplate,
    StatisticEventType,
    StatisticsDimension
} from 'src/@types/our-orders';
import { FilterDefinition } from 'src/_types/FilterDefinition';
import { Filter } from 'src/_helpers/Filter';

export abstract class ServiceApi<TModel extends ModelBase> {
    abstract type: ModelType;

    protected _Empty(changes: Partial<TModel>): Promise<TModel> {
        const pathModel = Object.keys(changes).map(k => ({ op: 'replace', path: `/${k}`, value: changes[k] }));
        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pathModel)
        };

        const url = `${config.apiUrl}/${this.type}/empty`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<TModel>(handleApiResponse)
            .then(response => {
                // tslint:disable-next-line:no-any
                response.Id = undefined as any;
                return response;
            });
    }

    Get(id: string): Promise<TModel> {

        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        const url = `${config.apiUrl}/${this.type}/${id}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<TModel>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    Delete(id: string): Promise<string> {

        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        };
        const url = `${config.apiUrl}/${this.type}/${id}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<string>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    Patch(id: string, changes: Partial<TModel>): Promise<TModel> {
        const pathModel = Object.keys(changes).map(k => ({ op: 'replace', path: `/${k}`, value: changes[k] }));
        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pathModel)
        };

        const url = `${config.apiUrl}/${this.type}/${id}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<TModel>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    PatchAll(all: { [id: string]: Partial<TModel> }): Promise<TModel[]> {
        const patchAllModel = {};
        Object.keys(all).forEach(id => {
            const changes = all[id];
            patchAllModel[id] = Object.keys(changes).map(k => ({ op: 'replace', path: `/${k}`, value: changes[k] }));
        });

        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchAllModel)
        };

        const url = `${config.apiUrl}/${this.type}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<TModel[]>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    Create(entry: Partial<TModel>): Promise<TModel> {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        };

        const url = `${config.apiUrl}/${this.type}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<TModel>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    Find(filterDef: Partial<FilterDefinition>, startIndex: number, stopIndex: number): Promise<FindResult<TModel>> {
        const { filters: f, sort, operator: o } = filterDef;
        const filters = f && [...f] || [];
        const operator = o || 'and';
        // if (query) {
        //     filters.push(Filter.Text(query));
        // }
        let body;
        switch (filters.length) {
            case 0:
                body = null;
                break;
            case 1:
                body = filters[0];
                break;
            default:
                body = operator === 'and' ? Filter.And(...filters) : Filter.Or(...filters);
                break;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body && JSON.stringify(body)
        };

        let querystring = `start=${startIndex}&take=${stopIndex - startIndex}`;
        if (sort) { querystring += `&sort=${sort}`; }

        const url = `${config.apiUrl}/${this.type}/find?${querystring}`;

        return fetch(url, addAuthHeader(requestOptions))
            .then<FindResult<TModel>>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    Count(filter: Filter): Promise<number> {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: filter.Operator ? JSON.stringify(filter.toJson()) : undefined
        };
        const url = `${config.apiUrl}/${this.type}/count`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<number>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
}

class ProductApi extends ServiceApi<Product> {
    type: ModelType = 'product';

    Empty(title: string, partial: Partial<Product>): Promise<Product> {
        const empty: Partial<Product> = {
            Title: title,
            NeedsDispatch: true
        };

        return super._Empty({ ...empty, ...partial });
    }

    Previews(): Promise<ProductPreview[]> {

        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        const url = `${config.apiUrl}/${this.type}/previews`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<ProductPreview[]>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
}

export const Products = new ProductApi();

class ServerStorageApi {
    Post(formData: FormData) {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        };

        const url = `${config.apiUrl}/storage`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<{ [name: string]: string }>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
}

export const ServerStorage = new ServerStorageApi();

class OrderApi extends ServiceApi<Order> {
    type: ModelType = 'order';

    Empty(partial: Partial<Order>): Promise<Order> {
        // const empty: Order = {
        //     Type: 'Order',
        //     Tax: 0,
        //     Price: 0,
        //     Total: 0,
        //     Dispatches: [],
        //     Currency: settings.Settings.Currencies[0],
        //     ShopId: (auth.user && auth.user.ShopId) || undefined,
        //     Weight: 0,
        //     OrderType: 'Order',
        //     Id: '',
        //     PaidAmount: 0,
        //     Paid: false,
        //     Payments: [],
        //     Items: []
        // };

        return super._Empty({ ...partial });
    }
    Preview(changes: Partial<Order>, id?: string): Promise<Order> {
        const pathModel = Object.keys(changes).map(k => ({ op: 'replace', path: `/${k}`, value: changes[k] }));
        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pathModel)
        };

        const url = `${config.apiUrl}/${this.type}/preview${id ? `/${id}` : ''}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<Order>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    Shippings(order: Order, startIndex: number, stopIndex: number): Promise<FindResult<ShippingTemplate>> {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        };
        const url = `${config.apiUrl}/${this.type}/shippings?start=${startIndex}&take=${stopIndex - startIndex}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<FindResult<ShippingTemplate>>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    GetReport(
        type: StatisticEventType,
        dimension: StatisticsDimension,
        start: Date,
        count: number,
        interval: TimeInterval): Promise<StatisticReport> {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Start: start, Count: count, TimeInterval: interval })
        };

        const url = `${config.apiUrl}/${this.type}/reports/${type}/${dimension}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<StatisticReport>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
}

export const Orders = new OrderApi();

class ClientApi extends ServiceApi<Client> {
    type: ModelType = 'client';

    Empty(partial: Partial<Client>): Promise<Client> {
        const empty: Partial<Client> = {
        };

        return super._Empty({ ...empty, ...partial });
    }
    ImportCsv(formData: FormData): Promise<Client[]> {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        };

        const url = `${config.apiUrl}/${this.type}/import/csv`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<Client[]>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
    ExportCsv(filterDef: Partial<FilterDefinition>): Promise<string> {
        const { filters: f, sort, operator: o } = filterDef;
        const filters = f && [...f] || [];
        const operator = o || 'and';
        // if (query) {
        //     filters.push(Filter.Text(query));
        // }
        let body;
        switch (filters.length) {
            case 0:
                body = null;
                break;
            case 1:
                body = filters[0];
                break;
            default:
                body = operator === 'and' ? Filter.And(...filters) : Filter.Or(...filters);
                break;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body && JSON.stringify(body)
        };

        let querystring = ``;
        if (sort) { querystring += `sort=${sort}`; }

        const url = `${config.apiUrl}/${this.type}/export/csv?${querystring}`;

        return fetch(url, addAuthHeader(requestOptions))
            .then<string>(handleApiResponse);
    }
}

export const Clients = new ClientApi();

class VoucherApi extends ServiceApi<Voucher> {
    type: ModelType = 'voucher';

    Empty(partial: Partial<Voucher>): Promise<Voucher> {
        const empty: Partial<Voucher> = {
            Expiration: new Date()
        };

        return super._Empty({ ...empty, ...partial });
    }
}

export const Vouchers = new VoucherApi();

class ShopApi extends ServiceApi<Shop> {
    type: ModelType = 'shop';

    Empty(name: string, partial: Partial<Shop>): Promise<Shop> {
        const empty: Partial<Shop> = {
            Name: name
        };

        return super._Empty({ ...empty, ...partial });
    }
}

export const Shops = new ShopApi();

class WarehouseApi extends ServiceApi<Warehouse> {
    type: ModelType = 'Warehouse';

    Empty(name: string, partial: Partial<Warehouse>): Promise<Warehouse> {
        const empty: Partial<Warehouse> = {
            Name: name
        };

        return super._Empty({ ...empty, ...partial });
    }
}

export const Warehouses = new WarehouseApi();

class CategoryApi extends ServiceApi<Category> {
    type: ModelType = 'category';

    Empty(title: string, partial: Partial<Category>): Promise<Category> {
        const empty: Partial<Category> = {
            Title: title
        };

        return super._Empty({ ...empty, ...partial });
    }
}

export const Categories = new CategoryApi();

class DocumentTemplateApi extends ServiceApi<DocumentTemplate> {
    type: ModelType = 'documenttemplate';

    Empty(title: string, partial: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
        const empty: Partial<DocumentTemplate> = {
            Title: title
        };

        return super._Empty({ ...empty, ...partial });
    }
    Order(tempalteId: string, orderId: string, changes: Partial<Order>): Promise<{ html: string; styles: string }> {
        const pathModel = Object.keys(changes).map(k => ({ op: 'replace', path: `/${k}`, value: changes[k] }));

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pathModel)
        };
        const url = `${config.apiUrl}/${this.type}/${tempalteId}/order/${orderId}`;

        return fetch(url, addAuthHeader(requestOptions))
            .then<{ html: string; styles: string }>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
    Orders(filterDef: Partial<FilterDefinition>, tempalteId: string):
        Promise<{ html: string; styles: string }> {
        const { filters: f, sort, operator: o } = filterDef;
        const filters = f && [...f] || [];
        const operator = o || 'and';

        let body;
        switch (filters.length) {
            case 0:
                body = null;
                break;
            case 1:
                body = filters[0];
                break;
            default:
                body = operator === 'and' ? Filter.And(...filters) : Filter.Or(...filters);
                break;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body && JSON.stringify(body)
        };

        let querystring = sort ? `&sort=${sort}` : '';

        const url = `${config.apiUrl}/${this.type}/${tempalteId}/orders?${querystring}`;

        return fetch(url, addAuthHeader(requestOptions))
            .then<{ html: string; styles: string }>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
    OrdersProducts(filterDef: Partial<FilterDefinition>, tempalteId: string):
        Promise<{ html: string; styles: string }> {
        const { filters: f, sort, operator: o } = filterDef;
        const filters = f && [...f] || [];
        const operator = o || 'and';

        let body;
        switch (filters.length) {
            case 0:
                body = null;
                break;
            case 1:
                body = filters[0];
                break;
            default:
                body = operator === 'and' ? Filter.And(...filters) : Filter.Or(...filters);
                break;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body && JSON.stringify(body)
        };

        let querystring = sort ? `&sort=${sort}` : '';

        const url = `${config.apiUrl}/${this.type}/${tempalteId}/ordersProducts?${querystring}`;

        return fetch(url, addAuthHeader(requestOptions))
            .then<{ html: string; styles: string }>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
    Client(tempalteId: string, clientId: string, changes: Partial<Client>): Promise<{ html: string; styles: string }> {
        const pathModel = Object.keys(changes).map(k => ({ op: 'replace', path: `/${k}`, value: changes[k] }));

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pathModel)
        };
        const url = `${config.apiUrl}/${this.type}/${tempalteId}/client/${clientId}`;

        return fetch(url, addAuthHeader(requestOptions))
            .then<{ html: string; styles: string }>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    Stocks(
        id: string,
        filterDef: Partial<FilterDefinition>,
        min: number,
        max: number,
        tempalteId: string):
        Promise<{ html: string; styles: string }> {
        const { filters: f, sort, operator: o } = filterDef;
        const filters = f && [...f] || [];
        const operator = o || 'and';

        let body;
        switch (filters.length) {
            case 0:
                body = null;
                break;
            case 1:
                body = filters[0];
                break;
            default:
                body = operator === 'and' ? Filter.And(...filters) : Filter.Or(...filters);
                break;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body && JSON.stringify(body)
        };

        let querystring = sort ? `&sort=${sort}` : '';

        const url = `${config.apiUrl}/${this.type}/${tempalteId}/stocks/${id}/${min}/${max}?${querystring}`;

        return fetch(url, addAuthHeader(requestOptions))
            .then<{ html: string; styles: string }>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
}

export const DocumentTemplates = new DocumentTemplateApi();

class MovementApi extends ServiceApi<Movement> {
    type: ModelType = 'movement';

    Cashbox(): Promise<Cashbox> {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        const url = `${config.apiUrl}/${this.type}/cashbox`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<Cashbox>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
    Empty(Currency: string, partial?: Partial<Movement>): Promise<Movement> {
        const date = new Date().toISOString().substr(0, 10);
        const empty: Partial<Movement> = {
            // User: `${user.FirstName} ${user.LastName}`,
            // UserId: user.Id,
            Date: date,
            Currency,
            // ShopId: user.ShopId,
            Archived: false
        };

        if (partial) {
            Object.keys(partial).forEach(k => {
                empty[k] = partial[k];
            });
        }
        return super._Empty({ ...empty, ...partial });
    }
    // FindMovement(
    //     binding: FindMovementBindings,
    //     sort: string,
    //     startIndex: number,
    //     stopIndex: number): Promise<FindResult<Movement>> {

    //     const requestOptions = {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(binding)
    //     };

    //     let querystring = `start=${startIndex}&take=${stopIndex - startIndex}`;
    //     if (sort) { querystring += `&sort=${sort}`; }

    //     const url = `${config.apiUrl}/${this.type}/findMovement?${querystring}`;

    //     return fetch(url, addAuthHeader(requestOptions))
    //         .then<FindResult<Movement>>(handleApiResponse)
    //         .then(response => {
    //             return response;
    //         });
    // }

    Balance(shop: string): Promise<{ archived: number }> {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        const url = `${config.apiUrl}/${this.type}/balance/${shop}`;

        return fetch(url, addAuthHeader(requestOptions))
            .then<{ archived: number }>(handleApiResponse);
    }
}

export const Movements = new MovementApi();

export interface StockUnitUpdateBindngs {
    SKU: string;
    Units: { [key: string]: number };
}

export type StockUnitWarehouseResult = { SKU: string; Stock: number };

class StockUnitApi extends ServiceApi<StockUnit> {
    type: ModelType = 'stockunit';

    Update(stockUpdate: StockUnitUpdateBindngs): Promise<StockUnit> {
        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stockUpdate)
        };

        const url = `${config.apiUrl}/${this.type}/update`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<StockUnit>(handleApiResponse);
    }

    Use(update: { [sku: string]: { [key: string]: number } }): Promise<StockUnit> {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update)
        };

        const url = `${config.apiUrl}/${this.type}/use`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<StockUnit>(handleApiResponse);
    }
    Warehouse(
        id: string,
        filterDef: Partial<FilterDefinition>,
        min: number,
        max: number,
        startIndex: number,
        stopIndex: number
    ): Promise<FindResult<StockUnitWarehouseResult>> {
        const { filters: f, sort, operator: o } = filterDef;
        const filters = f && [...f] || [];
        const operator = o || 'and';
        // if (query) {
        //     filters.push(Filter.Text(query));
        // }
        let body;
        switch (filters.length) {
            case 0:
                body = null;
                break;
            case 1:
                body = filters[0];
                break;
            default:
                body = operator === 'and' ? Filter.And(...filters) : Filter.Or(...filters);
                break;
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body && JSON.stringify(body)
        };

        let querystring = `start=${startIndex}&take=${stopIndex - startIndex}`;
        if (sort) { querystring += `&sort=${sort}`; }

        const url = `${config.apiUrl}/${this.type}/warehouse/${id}/${min}/${max}?${querystring}`;

        return fetch(url, addAuthHeader(requestOptions))
            .then<FindResult<StockUnitWarehouseResult>>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
}

export const StockUnits = new StockUnitApi();

class OrderItemApi {
    endpoint: string = 'orderitem';

    Empty(partial: Partial<OrderItem>): Promise<OrderItem> {
        const empty: OrderItem = {
            UID: '',
            Items: []
        };

        if (partial) {
            Object.keys(partial).forEach(k => {
                empty[k] = partial[k];
            });
        }
        return Promise.resolve(empty);
    }

    FromProducts(selections: ProductSelection[], currency: string): Promise<OrderItem[]> {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Currency: currency, Selections: selections })
        };
        const url = `${config.apiUrl}/${this.endpoint}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<OrderItem[]>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
}

export const OrderItems = new OrderItemApi();

class SettingsApi {

    Get(): Promise<Setting> {

        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        const url = `${config.apiUrl}/settings`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<Setting>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
    Patch(changes: Partial<Setting>): Promise<Setting> {
        const pathModel = Object.keys(changes).map(k => ({ op: 'replace', path: `/${k}`, value: changes[k] }));
        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pathModel)
        };

        const url = `${config.apiUrl}/settings`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<Setting>(handleApiResponse)
            .then(response => {
                return response;
            });
    }
}

export const Settings = new SettingsApi();

export type ResetResponse = { Id: string; Username: string; Code: string; Link: string };
class UsersApi { // extends ServiceApi<User> 
    // type: ModelType = 'User';
    endpoint: string = 'user';

    // Empty(firstName: string, partial: Partial<User>): Promise<User> {
    //     const empty: Partial<User> = {
    //         FirstName: firstName
    //     };

    //     return super._Empty({ ...empty, ...partial });
    // }

    GetAll(startIndex: number, stopIndex: number): Promise<FindResult<User>> {

        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };
        const url = `${config.apiUrl}/${this.endpoint}?start=${startIndex}&take=${stopIndex - startIndex}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<FindResult<User>>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    Patch(id: string, changes: Partial<User>): Promise<User> {
        const pathModel = Object.keys(changes).map(k => ({ op: 'replace', path: `/${k}`, value: changes[k] }));
        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pathModel)
        };

        const url = `${config.apiUrl}/${this.endpoint}/${id}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<User>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    Delete(id: string): Promise<User> {
        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        };

        const url = `${config.apiUrl}/${this.endpoint}/${id}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<User>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    Create(changes: Partial<User>): Promise<User> {
        const pathModel = Object.keys(changes).map(k => ({ op: 'replace', path: `/${k}`, value: changes[k] }));

        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pathModel)
        };

        const url = `${config.apiUrl}/${this.endpoint}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<User>(handleApiResponse)
            .then(response => {
                return response;
            });
    }

    Empty(changes: Partial<User>): Promise<User> {
        const pathModel = Object.keys(changes).map(k => ({ op: 'replace', path: `/${k}`, value: changes[k] }));
        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pathModel)
        };

        const url = `${config.apiUrl}/${this.endpoint}/empty`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<User>(handleApiResponse)
            .then(response => {
                response.Id = '';
                return response;
            });
    }
    Reset(id: string): Promise<ResetResponse> {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Id: id, resetFormURL: document.location.href, email: false })
        };

        const url = `${config.apiUrl}/${this.endpoint}/reset/${id}`;
        return fetch(url, addAuthHeader(requestOptions))
            .then<ResetResponse>(handleApiResponse);
    }
}

export const Users = new UsersApi();

type subscribeRequest = {
    FirstName: string;
    LastName: string;
    Email: string;
};

export const SubscribeNewsletter = (client: Client, provider: string): Promise<string> => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            FirstName: client.FirstName,
            LastName: client.LastName,
            Email: client.Email
        } as subscribeRequest)
    };

    const url = `${config.apiUrl}/${provider}/subscribe`;
    return fetch(url, addAuthHeader(requestOptions))
        .then<string>(handleApiResponse)
        .then(response => {
            return response;
        });
};