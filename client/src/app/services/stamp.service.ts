import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable } from "rxjs";

import { BE_PATH } from "src/urls";

import { StampList } from "@models/stamp.model";
import { AllClockModelList } from "@models/clock.model";

@Injectable()
export class StampService {
    constructor(
        private _http: HttpClient
    ) { }

    public getAllClocks() {
        return this._http.get<AllClockModelList>(`${BE_PATH.basePath}clocks/all`);
    }

    public getStampList(sn: string, userId: string, startDate: string, endDate: string, customerName: string, clockLocation: string, c_model: string, f_sent: string, __offset__: string): Observable<StampList> {
        return this._http.get<StampList>(`${BE_PATH.basePath}attlog`, {
            headers: {
                'x-sn': sn || "",
                'x-user-id': userId || "",
                'x-start-date': startDate || "",
                'x-end-date': endDate || "",
                'x-customer-name': customerName || "",
                'x-clock-location': clockLocation || "",
                'x-c-model': c_model || "",
                'x-f-sent': f_sent || "",
                'x-offset': __offset__ || "0",
            }
        });
    }

    public downloadStamps(sn: string, userId: string, startDate: string, endDate: string, customerName: string) {
        return this._http.post(`${BE_PATH.basePath}attlog/download`, {
            'sn': sn || "",
            'userId': userId || "",
            'startDate': startDate || "",
            'endDate': endDate || "",
            'customerName': customerName || ""
        }, {
            observe: 'response'
        });
    }

    public setAllStampsToBeSentToFtp(sn: string, userId: string, startDate: string, endDate: string, customerName: string, clockLocation: string) {
        return this._http.post(`${BE_PATH.basePath}attlog/set_all_to_be_sent`, {
            'sn': sn || "",
            'userId': userId || "",
            'startDate': startDate || "",
            'endDate': endDate || "",
            'customerName': customerName || "",
            'clockLocation': clockLocation || "",
        });
    }

    public setStampToBeSentToFtp(id: string | number) {
        return this._http.post(`${BE_PATH.basePath}attlog/set_to_be_sent`, {
            'id': id || ""

        });
    }
}
