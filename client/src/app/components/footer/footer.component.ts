import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";

import { AuthService } from '@services/auth.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    standalone: true,
    imports: [
        CommonModule
    ]
})
export class FooterComponent implements OnInit {
    public initDone = false
    public canShowLogo = true;

    constructor(
        public authService: AuthService,
    ) { }

    public ngOnInit(): void {

    }
}

