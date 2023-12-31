import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

import { BE_PATH } from "src/urls";
import { CustomerList } from "@models/customer.model";
import { GenericHttpResponse } from "@models/generics/generic.model";

@Injectable()
export class CustomerService {
    constructor(
        private _http: HttpClient
    ) { }

    public getCustomerList(name?: string, customer_code?: string): Observable<CustomerList> {
        return this._http.get<CustomerList>(`${BE_PATH.basePath}customer/list`, {
            headers: {
                'x-name': name || '',
                'x-customer-code': customer_code || ''
            }
        });
    }

    public createCustomer(customer_id: string = null, name: string, mail: string, cu_code: string, cu_note: string, apiKey: string): Observable<GenericHttpResponse> {
        return this._http.put<GenericHttpResponse>(`${BE_PATH.basePath}customer/add`, {
            name: name,
            mail: mail,
            cu_code: cu_code,
            cu_note: cu_note,
            cu_api_key: apiKey
        });
    }

    public updateCustomer(customer_id: string, name: string, mail: string, cu_code: string, cu_note: string, apiKey: string): Observable<GenericHttpResponse> {
        return this._http.post<GenericHttpResponse>(`${BE_PATH.basePath}customer/add`, {
            customer_id: customer_id,
            name: name,
            mail: mail,
            cu_code: cu_code,
            cu_note: cu_note,
            cu_api_key: apiKey
        });
    }

    public deleteCustomer(customer_id: string, cu_code: string) {
        return this._http.delete(`${BE_PATH.basePath}customer`, {
            headers: {
                "customer-id": customer_id,
                "cu-code": cu_code,
            }
        });
    }
}
