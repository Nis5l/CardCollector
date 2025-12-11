import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, Observable, map, startWith } from 'rxjs';

type SidebarMode = 'side' | 'over';

@Component({
    selector: 'cc-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ["./sidebar.component.scss"],
    standalone: false
})
export class SidebarComponent {
	private _open: boolean = false;
  public readonly screenWidth$: Observable<number>;
  public readonly sidebarMode$: Observable<SidebarMode>;

  @Output()
  public readonly closeSidebar: EventEmitter<void> = new EventEmitter<void>();

	@Input()
	public set open(b: boolean | null | undefined) {
		this._open = b == true;
	}

	public get open(): boolean {
		return this._open;
	}

  constructor(private readonly router: Router) {
    this.screenWidth$ = fromEvent(window, 'resize').pipe(
      map(window => (window.target as Window).innerWidth),
      startWith(window.innerWidth)
    );

    this.sidebarMode$ = this.screenWidth$.pipe(
      map((screenWidth) => screenWidth > 900 ? 'side' : 'over')
    );
  }

  public navigate(route: string, sidebarMode: SidebarMode): void {
    this.router.navigate([route]);
    if(sidebarMode == 'over') this.closeSidebar.emit();
  }
}
