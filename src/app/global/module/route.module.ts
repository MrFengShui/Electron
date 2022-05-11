import { NgModule } from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

import {DemoSortView} from "../../web/sort/sort.component";
import {DemoErrorView} from "../../web/error/error.component";

const routes: Routes = [
    {path: '', redirectTo: 'demo/sort', pathMatch: 'full'},
    {path: 'demo/sort', component: DemoSortView},
    {path: '**', component: DemoErrorView}
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
