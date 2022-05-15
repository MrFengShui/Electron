import { NgModule } from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

import {DemoErrorView} from "../../web/error/error.component";
import {DemoIconView} from "../../web/icon/icon.component";
import {DemoMazeGenerateView} from "../../web/maze/generate.component";
import {DemoSortView} from "../../web/sort/sort.component";

const routes: Routes = [
    {path: '', redirectTo: 'demo/sort', pathMatch: 'full'},
    {path: 'demo/icon', component: DemoIconView},
    {path: 'demo/maze/generate', component: DemoMazeGenerateView},
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
