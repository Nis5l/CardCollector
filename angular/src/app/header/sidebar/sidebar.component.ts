import { Component, Input } from '@angular/core';
import { fromEvent, Observable, map, startWith } from 'rxjs';

@Component({
    selector: 'cc-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ["./sidebar.component.scss"],
    standalone: false
})
export class SidebarComponent {
	private _open: boolean = false;
  public readonly screenWidth$: Observable<number>;

  constructor() {
    this.screenWidth$ = fromEvent(window, 'resize').pipe(
      map(window => (window.target as Window).innerWidth),
      startWith(window.innerWidth)
    );
  }

	@Input()
	public set open(b: boolean | null | undefined) {
		this._open = b == true;
	}

	public get open(): boolean {
		return this._open;
	}
}
