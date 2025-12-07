import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type { Id } from '../../types';
import { HttpService } from '../../services';

@Injectable()
export class ProfileImageService {
	constructor(private readonly httpService: HttpService) {}

	public uploadImage(image: File): Observable<void> {
		return this.httpService.putFile<void>("/user/profile-image", image);
	}

	public getImageUrl(id: Id): string {
		return this.httpService.apiUrl(`/user/${id}/profile-image`);
	}
}
