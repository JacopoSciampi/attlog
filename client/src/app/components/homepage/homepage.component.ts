import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { SpinnerComponent } from '@components/spinner/spinner.component';
import { AddClockModelComponent } from '@components/terminal/add-clock-model/add-clock-model.component';
import { DeleteClockModelComponent } from '@components/terminal/delete-clock-model/delete-clock-model.component';
import { NgHeroiconsModule } from '@dimaslz/ng-heroicons';
import { MODAL_SIZE } from '@enum/modal.enum';
import { ClockModelListDetails } from '@models/clock-model.model';
import { MetricListDetails } from '@models/metrics.model';
import { MetricsService } from '@services/metrics.sevice';
import { ModalService } from '@services/modal.service';
import { TerminalService } from '@services/terminal.service';
import { ToastService } from '@services/toast.service';


@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.scss'],
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        NgHeroiconsModule,
        MatTooltipModule,
        MatDialogModule,
        SpinnerComponent,
    ],
    providers: [MetricsService]
})
export class HomepageComponent implements OnInit {
    public initDone = false
    public canShowLogo = true;
    public isGettingMetrics = true;
    public metrics!: MetricListDetails;
    private _currentTime = new Date().getTime();
    public clockModelList!: ClockModelListDetails[];

    constructor(
        private _dialog: MatDialog,
        private _toastService: ToastService,
        private _t: TerminalService,
        private _metrics: MetricsService
    ) {
    }

    public ngOnInit(): void {
        this._getMetrics();
        this._getClockModelList();
    }

    private _getClockModelList(): void {
        this._t.getClockModelList().subscribe({
            next: (data) => {
                this.clockModelList = data?.data;
            }, error: (err) => {
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
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

    public deleteClockModel(item?: ClockModelListDetails): void {
        this._dialog.open(DeleteClockModelComponent, {
            height: MODAL_SIZE.SMALL,
            width: MODAL_SIZE.HALF,
            data: {
                cm_id: item?.cm_id || '',
                cm_name: item?.cm_name || '',
                cm_desc: item?.cm_desc || '',
            }
        }).afterClosed().subscribe({
            next: () => {
                this._getClockModelList();
            }
        });

    }

    public upsertClockModel(item?: ClockModelListDetails): void {
        this._dialog.open(AddClockModelComponent, {
            height: MODAL_SIZE.SMALL,
            width: MODAL_SIZE.HALF,
            data: {
                cm_id: item?.cm_id || '',
                cm_name: item?.cm_name || '',
                cm_desc: item?.cm_desc || '',
            }
        }).afterClosed().subscribe({
            next: () => {
                this._getClockModelList();
            }
        });
    }
}

