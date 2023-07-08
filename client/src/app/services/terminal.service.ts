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

    public getTerminalList(customerName: string, status: string): Observable<TerminalList> {
        return this._http.get<TerminalList>(`${BE_PATH.basePath}clocks`, {
            headers: {
                "x-customer-name": customerName || "",
                "x-status": status || ""
            }
        });
    }

    public addTerminal(c_sn: string, c_name: string, c_model: string, fk_customer_name: string, c_note: string, c_desc: string, c_location: string) {
        return this._http.put(`${BE_PATH.basePath}clocks`, {
            "c_sn": c_sn,
            "c_name": c_name,
            "c_model": c_model,
            "fk_customer_name": fk_customer_name,
            "c_note": c_note,
            "c_desc": c_desc,
            "c_location": c_location
        })
    }

    public updateTerminal(c_sn: string, c_name: string, c_model: string, fk_customer_name: string, c_note: string, c_desc: string, c_location: string) {
        return this._http.post(`${BE_PATH.basePath}clocks`, {
            "c_sn": c_sn,
            "c_name": c_name,
            "c_model": c_model,
            "fk_customer_name": fk_customer_name,
            "c_note": c_note,
            "c_desc": c_desc,
            "c_location": c_location
        })
    }

    public deleteTerminal(c_sn: string) {
        return this._http.delete(`${BE_PATH.basePath}clocks`, {
            headers: {
                "c_sn": c_sn,
            }
        });
    }
}
