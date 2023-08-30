import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { BE_PATH } from "src/urls";
import { Observable } from 'rxjs';
import { TerminalList } from "@models/terminal.model";
import { ClockModelList } from "@models/clock-model.model";

@Injectable()
export class TerminalService {
    constructor(
        private _http: HttpClient
    ) { }

    public syncTerminal(f_customer_name: string, f_status: string) {
        return this._http.post(`${BE_PATH.basePath}clocks/sync`, {
            f_customer_name: f_customer_name,
            f_status: f_status
        });
    }

    public getTerminalList(customerName: string, status: string): Observable<TerminalList> {
        return this._http.get<TerminalList>(`${BE_PATH.basePath}clocks`, {
            headers: {
                "x-customer-name": customerName || "",
                "x-status": status || ""
            }
        });
    }

    public addTerminal(c_sn: string, c_name: string, c_model: string, fk_customer_name: string, c_note: string, c_desc: string, c_location: string, c_custom_id: string, c_timezone: string) {
        return this._http.put(`${BE_PATH.basePath}clocks`, {
            "c_sn": c_sn,
            "c_name": c_name,
            "c_model": c_model,
            "fk_customer_name": fk_customer_name,
            "c_note": c_note,
            "c_desc": c_desc,
            "c_location": c_location,
            "c_custom_id": c_custom_id,
            "c_timezone": c_timezone
        });
    }

    public updateTerminal(c_sn: string, c_name: string, c_model: string, fk_customer_name: string, c_note: string, c_desc: string, c_location: string, c_timezone: string) {
        return this._http.post(`${BE_PATH.basePath}clocks`, {
            "c_sn": c_sn,
            "c_name": c_name,
            "c_model": c_model,
            "fk_customer_name": fk_customer_name,
            "c_note": c_note,
            "c_desc": c_desc,
            "c_location": c_location,
            "c_timezone": c_timezone
        })
    }

    public deleteTerminal(c_sn: string) {
        return this._http.delete(`${BE_PATH.basePath}clocks`, {
            headers: {
                "c-sn": c_sn,
            }
        });
    }

    public getClockModelList(): Observable<ClockModelList> {
        return this._http.get<ClockModelList>(`${BE_PATH.basePath}clock_models`);
    }

    public addClockModel(cm_name: string, cm_desc: string) {
        return this._http.put(`${BE_PATH.basePath}clock_models`, {
            'cm_name': cm_name,
            'cm_desc': cm_desc || "",
        });
    }

    public updateClockModel(cm_name: string, cm_desc: string, cm_id: string) {
        return this._http.post(`${BE_PATH.basePath}clock_models`, {
            'cm_id': cm_id || "",
            'cm_name': cm_name,
            'cm_desc': cm_desc || "",
        });
    }

    public deleteClockModel(cm_id: string) {
        return this._http.delete(`${BE_PATH.basePath}clock_models`, {
            headers: {
                "cm-id": cm_id,
            }
        });
    }
}
