import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.scss'],
    standalone: true,
    imports: [
        RouterModule,
        CommonModule
    ]
})
export class HomepageComponent implements OnInit {
    public initDone = false
    public canShowLogo = true;

    constructor(
        private _router: Router,
    ) { }

    public ngOnInit(): void {

    }
}

