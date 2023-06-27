import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    standalone: true,
    imports: [
        RouterModule,
        CommonModule
    ]
})
export class SettingsComponent implements OnInit {

    constructor(
        private _router: Router,
    ) { }

    public ngOnInit(): void {

    }
}

