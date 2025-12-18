import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from '../services';
import { Id } from '../types';

export function canActivateCollectorOwnerModerator(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  let collectorId: Id | null = childRoute.paramMap.get("collectorId");
  if(collectorId == null){
    return true;
  }
  return inject(UserService).isCollectorOwnerModerator(collectorId);
}
