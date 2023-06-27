import { RouterModule } from '@angular/router';
import { CommonModule, registerLocaleData } from '@angular/common';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

import { ToastrModule } from 'ngx-toastr';
import { OAuthStorage, OAuthModule } from "angular-oauth2-oidc";

import { RootComponent } from '@components/root/root.component';

import { AuthService } from '@services/auth.service';
import { ToastService } from '@services/toast.service';
import { StampService } from '@services/stamp.service';
import { TerminalService } from '@services/terminal.service';
import { CustomerService } from '@services/customer.service';

import { routes } from './routing';

import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import localeIt from '@angular/common/locales/it';
import * as it from 'dayjs/locale/it';
registerLocaleData(localeIt);
const locale = it;

export function storageFactory(): OAuthStorage {
    return localStorage
}

bootstrapApplication(RootComponent, {
    providers: [
        { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { disableClose: true, hasBackdrop: false } },
        { provide: OAuthStorage, useFactory: storageFactory },
        ToastService,
        AuthService,
        StampService,
        CustomerService,
        TerminalService,
        importProvidersFrom(
            NgxDaterangepickerMd.forRoot({
                applyLabel: 'Applica',
                format: 'DD/MM/YYYY',
                locale: locale,
                displayFormat: 'DD/MM/YYYY'
            }),
            OAuthModule.forRoot(),
            RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload', initialNavigation: 'enabledNonBlocking' }),
            CommonModule,
            BrowserModule,
            BrowserAnimationsModule,
            HttpClientModule,
            BrowserAnimationsModule,
            ToastrModule.forRoot({
                preventDuplicates: true,
                progressBar: true,
            }),
        ),
    ]
});
