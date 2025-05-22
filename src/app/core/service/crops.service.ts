import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { crop } from '../../shared/models/cropsModel';
import { environmentDev1 } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CroService {
  private http = inject(HttpClient);
  private api = `${environmentDev1.apiUrl}/crops`;

  getCrops(): Observable<crop[]> {
    return this.http.get<crop[]>(this.api);
  }
}
