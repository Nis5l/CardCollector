import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService, HttpService } from '../../../shared/services';

import { SubscriptionManagerComponent } from '../../../shared/abstract';

@Component({
    selector: 'cc-logout',
    template: '',
    styleUrls: [],
    standalone: false
})
export class LogoutComponent extends SubscriptionManagerComponent implements OnInit {
	constructor(private readonly authService: AuthService, private readonly httpService: HttpService, private readonly router: Router) { super(); }

	public ngOnInit(): void {
		const logout = () => {
			this.authService.logout();
			this.router.navigate(["login"]);
		};
		this.registerSubscription(
			this.httpService.post("/logout", {}, { withCredentials: true }).subscribe({
				error: () => logout(),
				next: () => logout(),
        complete: () => logout(),
			})
		);
	}
}
