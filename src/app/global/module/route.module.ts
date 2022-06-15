import { NgModule } from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

import {DemoErrorView} from "../../web/error/error.component";
import {DemoTestView} from "../../web/test/test.component";
import {DemoOutletView} from "../../web/demo/demo.component";

const routes: Routes = [
    {path: '', redirectTo: 'demo/navigation', pathMatch: 'full'},
    {path: 'demo', component: DemoOutletView, loadChildren: () =>
            import('../../web/demo/demo.module').then(module => module.WebDemoModule)},
    {path: 'error/404', component: DemoErrorView},
    {path: 'test', component: DemoTestView},
    {path: '**', redirectTo: 'error/404', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: 'legacy',
      useHash: false
  })],
  exports: [RouterModule]
})
export class GlobalRouteModule { }
