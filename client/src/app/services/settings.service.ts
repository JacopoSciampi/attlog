import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { BE_PATH } from "src/urls";
import { SettingsDetails, SettingsDetailsData } from "@models/settings.model";

@Injectable()
export class SettingsService {
    constructor(
        private _http: HttpClient
    ) { }

    public getSettings() {
        return this._http.get<SettingsDetailsData>(`${BE_PATH.basePath}settings`);
    }

    public createSettings(data: SettingsDetails) {
        return this._http.put(`${BE_PATH.basePath}settings`, data);
    }

    public updateEmailSettings(data: SettingsDetails) {
        return this._http.post(`${BE_PATH.basePath}settings/email`, data);
    }

    public updateFtpSettings(data: SettingsDetails) {
        return this._http.post(`${BE_PATH.basePath}settings/ftp`, data);
    }

    public updateStampsSettings(data: SettingsDetails) {
        return this._http.post(`${BE_PATH.basePath}settings/stamps`, data);
    }
}
