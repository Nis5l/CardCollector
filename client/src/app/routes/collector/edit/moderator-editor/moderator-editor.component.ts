import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, BehaviorSubject, filter, switchMap, map, shareReplay } from 'rxjs';

import { SubscriptionManagerComponent } from '../../../../shared/abstract';
import { UserService, AuthService } from '../../../../shared/services';
import { SelectUserDialogComponent } from '../../../../shared/dialogs';
import type { Id } from '../../../../shared/types';
import type { User } from '../../../../shared/types/user';
import { ModeratorEditorService } from './moderator-editor.service';
import { CollectorService } from '../../collector.service';
import type { CollectorConfig } from '../../types';

@Component({
    selector: "cc-collector-moderator-editor",
    templateUrl: "./moderator-editor.component.html",
    styleUrls: ["./moderator-editor.component.scss"],
    standalone: false
})
export class ModeratorEditorComponent extends SubscriptionManagerComponent {
  public readonly moderators$: Observable<User[]>;

  public readonly isOwner$: Observable<boolean>;

  private readonly collectorIdSubject: BehaviorSubject<Id | null> = new BehaviorSubject<Id | null>(null);
  public readonly collectorId$: Observable<Id>;

  private readonly configSubject: BehaviorSubject<CollectorConfig | null> = new BehaviorSubject<CollectorConfig | null>(null);
  public readonly config$: Observable<CollectorConfig>;

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

  constructor(
    private readonly moderatorEditorService: ModeratorEditorService,
    private readonly collectorService: CollectorService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly matDialog: MatDialog,
  ) {
    super();

    this.collectorId$ = this.collectorIdSubject.asObservable().pipe(
      filter((collectorId): collectorId is Id => collectorId != null)
    );
    this.config$ = this.configSubject.asObservable().pipe(
      filter((config): config is CollectorConfig => config != null)
    );

    this.moderators$ = this.collectorId$.pipe(
      switchMap(collectorId => this.collectorService.getModerators(collectorId).pipe(
        map(({ moderators }) => moderators)
      )),
      shareReplay(1)
    );

    this.isOwner$ = this.collectorId$.pipe(
      switchMap(collector_id => this.userService.isCollectorOwner(collector_id)),
      shareReplay(1)
    );
  }

  public addModerator(collector_id: Id): void {
    const userId = this.authService.getUserId();
    if(userId == null) throw new Error("userId not set");
    SelectUserDialogComponent.open(this.matDialog, { excludeUserIds: [ userId ] });
  }
}
