import { NgModule } from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

import {DemoErrorView} from "../../web/error/error.component";
import {DemoTestView} from "../../web/test/test.component";
import {DemoOutletView} from "../../web/demo/demo.component";
import {DemoHomeView} from "../../web/home/home.component";
import {DemoLoginView} from "../../web/login/login.component";
import {AuthorizeCanActive} from "../auth/active.service";

const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: DemoHomeView, canActivate: [AuthorizeCanActive]},
    {path: 'login', component: DemoLoginView},
    {path: 'demo', component: DemoOutletView, canActivate: [AuthorizeCanActive],
        loadChildren: () => import('../../web/demo/demo.module').then(module => module.WebDemoModule)},
    {path: 'error/404', component: DemoErrorView},
    {path: 'test', component: DemoTestView},
    {path: '**', redirectTo: 'error/404', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: 'legacy',
      useHash: true
  })],
  exports: [RouterModule]
})
export class GlobalRouteModule { }
