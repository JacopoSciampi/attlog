import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { BE_PATH } from "src/urls";

@Injectable()
export class TerminalService {
    constructor(
        private _http: HttpClient
    ) { }

    public testConnection(address: string) {
        return this._http.post(`${BE_PATH.basePath}terminal/test-connection`, {
            address: address
        });
    }
}
