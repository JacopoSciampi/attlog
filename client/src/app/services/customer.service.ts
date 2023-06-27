import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { BE_PATH } from "src/urls";
import { Observable } from "rxjs";
import { GenericHttpResponse } from "@models/generics/generic.model";
import { CustomerList } from "@models/customer.model";

@Injectable()
export class CustomerService {
    constructor(
        private _http: HttpClient
    ) { }

    public getCustomerList(): Observable<CustomerList> {
        return this._http.get<CustomerList>(`${BE_PATH.basePath}customer/list`);
    }

    public createCustomer(name: string, mail: string): Observable<GenericHttpResponse> {
        return this._http.post<GenericHttpResponse>(`${BE_PATH.basePath}customer/add`, {
            name: name,
            mail: mail
        });
    }
}
