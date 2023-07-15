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
        set_terminal_file_name: '',
        set_terminal_file_format: '',
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
            next: (data: any) => {
                this.hasConfig = !!data?.data;

                if (data?.data) {
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
        this._.updateEmailSettings(this.settings).subscribe({});
    }
}

