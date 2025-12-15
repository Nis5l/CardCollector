import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, timer, forkJoin, tap } from 'rxjs';

import { PackTimeResponse } from './types';
import { CollectorOpenService } from './collector-open.service';

import type { Id } from '../../../../shared/types';
import { SubscriptionManagerComponent } from '../../../../shared/abstract';

const UPDATE_FREQUENCY_MS = 100;

@Component({
    selector: "cc-collector-open",
    templateUrl: "./collector-open.component.html",
    styleUrls: ["./collector-open.component.scss"],
    standalone: false
})
export class CollectorOpenComponent extends SubscriptionManagerComponent implements OnInit, OnDestroy {

	public _collectorId: Id | null = null;
	@Input()
	public set collectorId(id: Id) {
		this._collectorId = id;
	}
	public get collectorId(): Id {
		if(this._collectorId == null) throw new Error("collectorId not set");
		return this._collectorId;
	}

	@Input()
	public radius: number = 46;

	public progress: number = 1;

	private maxTime: number = 0;
	private packTime: Date | undefined = undefined;

	private timerSubscription: Subscription | undefined = undefined;

	public displayText: string = "";

	constructor(
		private readonly collectorOpenService: CollectorOpenService,
		private readonly router: Router
	){
    super();
  }

	public ngOnInit(){
		this.registerSubscription(this.refreshTime().subscribe(() => {
			this.startCounter();
		}));
	}

	public override ngOnDestroy(){
    super.ngOnDestroy();
		this.stopCounter();
	}

	public get strokeDashes(): number{
		return this.radius * 2 * Math.PI
	}

	public get strokeOffset(): number{
		return this.strokeDashes - this.progress * this.strokeDashes;
	}

	public onClick(){
		if(this.progress < 1.0) return;
		this.collectorOpenService.openPack(this.collectorId).subscribe((res) => {
			this.progress = 0;
			this.registerSubscription(this.refreshTime().subscribe(() => {
				this.startCounter();
			}));
			//TODO: change this if more than one card can be pulled
			this.router.navigate(["card", res.cards[0].id], { queryParams: { unlocked: true } });
		});
	}

	private refreshTime(): Observable<unknown>{
		let streams = [];
		streams.push(this.collectorOpenService.getMaxTime(this.collectorId).pipe(
			tap(res => {
				this.maxTime = this.parseDuration(res.packTimeMax);
			})
		));

		streams.push(this.collectorOpenService.getTime(this.collectorId).pipe(
			tap((res: PackTimeResponse) => {
				this.packTime = new Date(res.packTime);
			})
		));

		return forkJoin(streams).pipe(
			tap(_ => {
				this.updateProgress();
			})
		);
	}

	private updateProgress(){
		if(this.packTime == null){
			this.progress = 0;
			return;
		}
		let diff: number = (this.packTime.getTime() - Date.now());
		this.progress =  Math.min(1.0, 1.0 - diff / this.maxTime);
		setTimeout(() => {
			this.displayText = this.createDisplayText();
		});
	}

	private startCounter(){
		this.timerSubscription = timer(0, UPDATE_FREQUENCY_MS).subscribe(() => {
			this.updateProgress();
			if(this.progress >= 1.0) this.stopCounter();
		});
	}

	private stopCounter(){
		if(this.timerSubscription == null) return;
		this.timerSubscription.unsubscribe();
		this.timerSubscription = undefined;
	}

	private createDisplayText(): string{
		if(this.progress >= 1.0) return "Open";
		if(this.packTime == null) return "Error";

		let now = Date.now();
		let end = this.packTime.getTime();
		let ms = end - now;

		let seconds = Math.floor(ms / 1000);
		let minutes = Math.floor(seconds / 60);
		seconds -= minutes * 60;

		let text = "";
		if(minutes < 10){
			text += "0";
		}
		text += minutes;

		text += ":";

		if(seconds < 10){
			text += "0";
		}
		text += seconds;

    console.log("open text", text);

		return text;
	}

	private parseDuration(durationString: string): number{
		const isoDuration: RegExp = /^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;
		let parsed = isoDuration.exec(durationString);
		if(parsed == null) return 0;
		parsed.shift();
		const values = parsed.map((s: string) => s == null ? 0 : parseInt(s));
		const [yearStr, monthStr, weekStr, dayStr, hourStr, minuteStr, secondStr, millisecondsStr] = values;

		let millis = 0;
		if(yearStr != null) millis += yearStr * 365 * 24 * 60 * 60 * 1000;
		if(monthStr != null) millis += monthStr * 30 * 24 * 60 * 60 * 1000;
		if(dayStr != null) millis += dayStr * 24 * 60 * 60 * 1000;
		if(hourStr != null) millis += hourStr * 60 * 60 * 1000;
		if(minuteStr != null) millis += minuteStr * 60 * 1000;
		if(secondStr != null) millis += secondStr * 1000;
		if(millisecondsStr != null) millis += millisecondsStr;
		return millis;
	}
}
