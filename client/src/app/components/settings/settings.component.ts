import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';

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
    ]
})
export class SettingsComponent implements OnInit {
    public isGettingData = false;
    public email = {
        address: '',
        port: '',
        user: '',
        password: '',
        sender: '',
        receiverList: '',
        offlineAfter: '',
    }
    public ftp = {
        ip: '',
        port: '',
        user: '',
        password: '',
        folder: '',
        sendEvery: ''
    }

    public stamp = {
        filename: '',
        fileFormat: ''
    }
    constructor(
        private _router: Router,
    ) { }

    public ngOnInit(): void {

    }
}

