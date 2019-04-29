import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { components } from './components/index';
import { containers } from './containers/index';

@NgModule({
  declarations: [...components, ...containers],
  exports: [...components, ...containers],
  imports: [CommonModule]
})
export class ReportsModule {}
