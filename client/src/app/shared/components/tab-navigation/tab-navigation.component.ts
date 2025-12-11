import { Component, Input, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import type { NavigationItem } from './types';

@Component({
    selector: 'cc-tab-navigation',
    templateUrl: './tab-navigation.component.html',
    styleUrls: ['./tab-navigation.component.scss'],
    standalone: false
})
export class TabNavigationComponent implements AfterViewInit, OnDestroy {
  @Input()
  public items: NavigationItem[] = [];

  public open: boolean = false;
  public hiddenId: number = 0;

  private resizeObserver!: ResizeObserver;

  constructor(private host: ElementRef<HTMLElement>) {}

  public toggleOpen(): void {
    this.open = !this.open;
  }

  public getLink(item: NavigationItem): string {
    return typeof item.link === 'string' ? item.link : item.link();
  }

  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => this.onResized());
    this.resizeObserver.observe(this.host.nativeElement);
    // initial calculation
    this.onResized();
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
  }

  private onResized(): void {
    const element = this.host.nativeElement;
    const availableWidth = element.offsetWidth;
    const children = element.children;
    this.hiddenId = this.items.length;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      if (availableWidth < (child.offsetLeft + child.offsetWidth)) {
        console.log("hiddenID", this.hiddenId);
        this.hiddenId = i;
        break;
      }
    }
  }
}
