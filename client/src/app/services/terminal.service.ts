import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { BE_PATH } from "src/urls";
import { Observable } from 'rxjs';
import { TerminalList } from "@models/terminal.model";

@Injectable()
export class TerminalService {
    constructor(
        private _http: HttpClient
    ) { }

    public getTerminalList(customerName: string): Observable<TerminalList> {
        return this._http.get<TerminalList>(`${BE_PATH.basePath}clocks`, {
            headers: {
                "x-customer-name": customerName || ""
            }
        });
    }
}
