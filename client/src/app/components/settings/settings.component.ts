import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from '@components/spinner/spinner.component';
import { SettingsService } from '@services/settings.service';
import { ToastService } from '@services/toast.service';
import { takeWhile, finalize } from 'rxjs';

import { MatStepperModule } from '@angular/material/stepper';
import { NgHeroiconsModule } from '@dimaslz/ng-heroicons';
import { SettingsDetails } from '@models/settings.model';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        MatTooltipModule,
        FormsModule,
        SpinnerComponent,
        NgHeroiconsModule,
        MatStepperModule,
    ],
    providers: [
        SettingsService
    ]
})
export class SettingsComponent implements OnInit {
    public isGettingData = true;
    public hasConfig!: boolean;
    public canCreateConfig = false;

    public settings: SettingsDetails = {
        set_mail_smtp: '',
        set_mail_ssl: false,
        set_mail_port: '',
        set_mail_user: '',
        set_mail_pass: '',
        set_mail_sender: '',
        set_mail_receiver_list: '',
        set_mail_offline_after: '',
        set_ftp_server_ip: '',
        set_ftp_server_port: '',
        set_ftp_server_user: '',
        set_ftp_server_password: '',
        set_ftp_server_folder: '',
        set_ftp_send_every: '',
        set_ftp_enabled: false,
        set_terminal_file_name: '',
        set_terminal_file_format: '',
        set_terminal_attendance: '',
        set_terminal_pause: '',
        set_terminal_service: ''
    };

    constructor(
        private _: SettingsService,
        private _toastService: ToastService,
    ) { }

    public ngOnInit(): void {
        this._getSettings();
    }

    private _getSettings(): void {
        let take = true;
        this._.getSettings().pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: (data) => {
                this.hasConfig = !!data?.data;

                if (data?.data) {
                    data.data.set_mail_ssl = data.data.set_mail_ssl === "false" ? false : true;
                    data.data.set_ftp_enabled = data.data.set_ftp_enabled === "true" ? true : false;
                    this.settings = data.data;
                }

                this.isGettingData = false;
            }, error: (err) => {
                this.isGettingData = false;
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        })
    }

    public onWizardSave(): void {
        let take = true;
        this._.createSettings(this.settings).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
                this._getSettings();
            }, error: (err) => {
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }

    public onSaveEmailSettings(): void {
        let take = true;
        this._.updateEmailSettings(this.settings).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
                this._toastService.generic("Operazione completata", "Aggiornamento avvenuto con successo")
                this._getSettings();
            }, error: (err) => {
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }

    public onSaveFtpSettings(): void {
        let take = true;
        this._.updateFtpSettings(this.settings).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
                this._toastService.generic("Operazione completata", "Aggiornamento avvenuto con successo")
                this._getSettings();
            }, error: (err) => {
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }

    public onSaveStampsSettings(): void {
        let take = true;
        this._.updateStampsSettings(this.settings).pipe(
            takeWhile(() => take),
            finalize(() => take = false)
        ).subscribe({
            next: () => {
                this._toastService.generic("Operazione completata", "Aggiornamento avvenuto con successo")
                this._getSettings();
            }, error: (err) => {
                this._toastService.errorGeneric(err.error.title, err.error.message)
            }
        });
    }
}

