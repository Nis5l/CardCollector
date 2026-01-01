import { Component, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, filter, switchMap, tap, map, shareReplay, mapTo, Subject, combineLatest, startWith } from 'rxjs';

import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import type { Id } from '../../../../shared/types';
import { SettingsEditorService } from './settings-editor.service';
import type { CollectorConfig } from '../../types';
import type { GetSettingsResponse } from './types';

type SettingsEditorFormGroup = FormGroup<{
  [K in keyof GetSettingsResponse]: FormControl<GetSettingsResponse[K]>;
}>;

type TypedCollectorConfig = {
  [K in keyof GetSettingsResponse]: { min: number; max: number };
};

@Component({
    selector: "cc-collector-settings-editor",
    templateUrl: "./settings-editor.component.html",
    styleUrls: ["./settings-editor.component.scss"],
    standalone: false
})
export class SettingsEditorComponent extends SubscriptionManagerComponent {
  private readonly refreshSettingsSubject: Subject<void> = new Subject<void>();

  private readonly collectorIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
  public readonly collectorId$: Observable<Id>;

  private readonly configSubject: BehaviorSubject<CollectorConfig | null> = new BehaviorSubject<CollectorConfig | null>(null);
  public readonly config$: Observable<TypedCollectorConfig>;

  @Input()
  public set collectorId(id: Id | null | undefined) {
    if(id == null) return;
    this.collectorIdSubject.next(id);
  }
  public get collectorId(): Id {
    const collectorId = this.collectorIdSubject.getValue();
    if(collectorId == null) throw new Error("collectorId not set");
    return collectorId;
  }

  @Input()
  public set config(config: CollectorConfig | null | undefined) {
    if(config == null) return;
    this.configSubject.next(config);
  }
  public get config(): CollectorConfig {
    const config = this.configSubject.getValue();
    if(config == null) throw new Error("config not set");
    return config;
  }

  public readonly formGroup$: Observable<SettingsEditorFormGroup>;

  public readonly settingKeys: Record<keyof GetSettingsResponse, string> = {
    packCooldown: 'Pack Cooldown',
    //packAmount: 'Pack Amount',
    packQualityMin: 'Minimum Pack Quality',
    packQualityMax: 'Maximum Pack Quality',
  };

  public readonly objectKeys = Object.keys as <T>(obj: T) => (keyof T)[];

  private readonly loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly loading$: Observable<boolean>;

  constructor(
    private readonly settingsEditorService: SettingsEditorService,
  ) {
    super();

    this.collectorId$ = this.collectorIdSubject.asObservable().pipe(
      filter((collectorId): collectorId is Id => collectorId != null)
    );
    this.config$ = this.configSubject.asObservable().pipe(
      filter((config): config is CollectorConfig => config != null)
    );

    const settings$: Observable<GetSettingsResponse> = combineLatest([this.collectorId$, this.refreshSettingsSubject.pipe(startWith(0))]).pipe(
      switchMap(([collectorId]) => this.settingsEditorService.getSettings(collectorId).pipe()),
      shareReplay(1)
    );

    this.formGroup$ = combineLatest([settings$, this.config$]).pipe(
      map(([settings, config]) => {
        const controls: { [K in keyof GetSettingsResponse]: FormControl<number> } = {} as any;

        for (const key of Object.keys(settings) as (keyof GetSettingsResponse)[]) {
          controls[key] = new FormControl(settings[key], {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.min(config[key].min),
              Validators.max(config[key].max),
            ],
          });
        }

        return new FormGroup(controls);
      }),
      tap(() => this.loadingSubject.next(false)),
      shareReplay(1)
    );

    this.loading$ = this.loadingSubject.asObservable();
    this.loadingSubject.next(true);
  }

  public save(collectorId: Id, formGroup: SettingsEditorFormGroup): void {
    if (formGroup.invalid) return;
    const values = formGroup.value;

    this.loadingSubject.next(true);
    this.registerSubscription(this.settingsEditorService.setSettings(collectorId, values).subscribe(
      () => this.refresh()
    ));
  }

  public refresh(): void {
    this.loadingSubject.next(true);
    this.refreshSettingsSubject.next();
  }

  /* public addModerator(collectorId: Id, moderators: User[]): void {
    const userId = this.authService.getUserId();
    if(userId == null) throw new Error("userId not set");
    this.registerSubscription(SelectUserDialogComponent.open(this.matDialog, { excludeUserIds: [ userId, ...moderators.map(({id}) => id) ], title: "Add Moderator" }).pipe(
      filter((user): user is User => user != null),
      switchMap(user => YesNoCancelDialogComponent.open(this.matDialog, `Add ${user.username} as moderator?`).pipe(
        filter(res => res === true),
        mapTo(user),
        switchMap(user => this.moderatorEditorService.addModerator(collectorId, user.id))
      ))
    ).subscribe(() => this.refreshModeratorsSubject.next()));
  }

  public removeModerator(collectorId: Id, user: User): void {
    this.registerSubscription(YesNoCancelDialogComponent.open(this.matDialog, `Remove ${user.username} as moderator?`).pipe(
      filter(res => res === true),
      mapTo(user),
      switchMap(user => this.moderatorEditorService.removeModerator(collectorId, user.id))
    ).subscribe(() => this.refreshModeratorsSubject.next()));
  } */
}
