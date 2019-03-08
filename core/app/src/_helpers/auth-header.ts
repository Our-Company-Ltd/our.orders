import { LOCALSTORAGE_KEY } from '../_context';
import { User, ApiModel } from 'src/@types/our-orders';

export const addAuthHeader = (requestOptions: RequestInit) => {
    // return authorization header with jwt token
    const localUser = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!localUser) { return requestOptions; }

    const user = JSON.parse(localUser) as User;

    if (!user || !user.Token) { return requestOptions; }
    requestOptions.headers = { ...requestOptions.headers, 'Authorization': 'Bearer ' + user.Token };
    return requestOptions;
};

export const handleApiResponse = <Model>(response: Response): Promise<Model> => {
    return new Promise((resolve, reject) => {
        if (response.ok) {
            // return model if it was returned in the response
            var contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                response.json().then(json => {
                    var apiresponse = json as ApiModel<Model>;
                    if (!apiresponse.Result.Success) {
                        // 
                        return reject(apiresponse);
                    }
                    return resolve(apiresponse.Value);
                }).catch((reason) => {
                    // impossible to parse json
                    return reject({
                        Result: {
                            Success: false,
                            Message: reason,
                        },
                        Value: null
                    });
                });
            } else {
                resolve();
            }
        } else {
            // return error message from response body
            response.text().then(reason => reject({
                Result: {
                    Success: false,
                    Message: reason,
                },
                Value: null
            }));
        }
    });
};