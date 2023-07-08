import { CommonModule } from '@angular/common';
import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from '@angular/router';

import { FooterComponent } from '@components/footer/footer.component';
import { NavbarComponent } from '@components/navbar/navbar.component';
import { SidenavComponent } from '@components/sidenav/sidenav.component';

import { AuthService } from '@services/auth.service';
import { ConstClass } from '@static/const.class';

@Component({
    selector: 'app-root',
    templateUrl: './root.component.html',
    styleUrls: ['./root.component.scss'],
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        NavbarComponent,
        FooterComponent,
        SidenavComponent,
    ],
    providers: [
        AuthService
    ]
})
export class RootComponent implements OnInit {
    public initDone = false

    constructor(
        private _router: Router,
        private _auth: AuthService,
    ) { }

    public ngOnInit(): void {
        this._auth.__init__().then(() => {
            ConstClass.token = this._auth.oAuthService.getAccessToken();
            this.initDone = true;
            this._router.navigate(['homepage']);
        });
    }
}

