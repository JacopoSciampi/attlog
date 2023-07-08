import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BE_PATH } from "src/urls";
import { Observable } from 'rxjs';
import { MetricList } from "@models/metrics.model";

@Injectable()
export class MetricsService {
    constructor(
        private _http: HttpClient
    ) { }

    public getMetrics(): Observable<MetricList> {
        return this._http.get<MetricList>(`${BE_PATH.basePath}metrics`);
    }
}
