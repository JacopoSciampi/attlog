import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { MetricListDetails } from '@models/metrics.model';
import { MetricsService } from '@services/metrics.sevice';
import { ToastService } from '@services/toast.service';


@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.scss'],
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        MatTooltipModule,
    ],
    providers: [MetricsService]
})
export class HomepageComponent implements OnInit {
    public initDone = false
    public canShowLogo = true;
    public isGettingMetrics = true;
    public metrics!: MetricListDetails;
    private _currentTime = new Date().getTime();

    constructor(
        private _router: Router,
        private _toastService: ToastService,
        private _metrics: MetricsService
    ) {
    }

    public ngOnInit(): void {
        this._getMetrics();
    }

    private _getMetrics(): void {
        this.isGettingMetrics = true;
        this._metrics.getMetrics().subscribe({
            next: (data) => {
                this.metrics = data?.data;
                this.isGettingMetrics = false;
            }, error: (err) => {
                this.isGettingMetrics = false;
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }

    public formatUptime(timestamp: number, isTooltip: boolean): string {
        const difference = this._currentTime - timestamp;

        const seconds = Math.floor(difference / 1000) % 60;
        const minutes = Math.floor(difference / (1000 * 60)) % 60;
        const hours = Math.floor(difference / (1000 * 60 * 60)) % 24;
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));

        if (isTooltip) {
            let formattedString = '';
            if (days > 0) formattedString += `${days} ${days === 1 ? 'giorno' : 'giorni'}, `;
            if (hours > 0) formattedString += `${hours} ${hours === 1 ? 'ora' : 'ore'}, `;
            if (minutes > 0) formattedString += `${minutes} ${minutes === 1 ? 'minuto' : 'minuti'}, `;
            formattedString += `${seconds} ${seconds === 1 ? 'secondo' : 'secondi'}`;

            return formattedString;
        }

        if (days > 0) return `${days} ${days === 1 ? 'giorno' : 'giorni'}`;
        if (hours > 0) return `${hours} ${hours === 1 ? 'ora' : 'ore'}`;
        if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minuto' : 'minuti'}`;
        return `${seconds} ${seconds === 1 ? 'secondo' : 'secondi'}`;

    }
}

