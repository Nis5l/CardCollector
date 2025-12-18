import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

//import type {  } from './types';
import type { Id } from '../../../../shared/types';
import { HttpService } from '../../../../shared/services';


@Injectable()
export class ModeratorEditorService {
	constructor(private readonly httpService: HttpService) {}
}
