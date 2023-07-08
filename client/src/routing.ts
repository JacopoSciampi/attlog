import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, Routes } from "@angular/router";

import { StampsComponent } from "@components/stamps/stamps.component";
import { HomepageComponent } from "@components/homepage/homepage.component";
import { SettingsComponent } from "@components/settings/settings.component";
import { TerminalComponent } from "@components/terminal/terminal.component";
import { CustomersComponent } from "@components/customers/customers.component";

const canActivateRoute: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        return true;
    };

export const routes: Routes = [{
    path: 'homepage',
    component: HomepageComponent,
    canActivate: [canActivateRoute]
},
{
    path: 'customers',
    component: CustomersComponent,
    canActivate: [canActivateRoute]
},
{
    path: 'terminal/:name',
    component: TerminalComponent,
    canActivate: [canActivateRoute]
},
{
    path: 'stamps/:clockSn',
    component: StampsComponent,
    canActivate: [canActivateRoute]
},
{
    path: 'settings',
    component: SettingsComponent,
    canActivate: [canActivateRoute]
}];
