import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { HttpService } from './http.service';
import { AuthModule } from '../auth-service';

@NgModule({ imports: [AuthModule], providers: [HttpService, provideHttpClient(withInterceptorsFromDi())] })
export class HttpModule {}

