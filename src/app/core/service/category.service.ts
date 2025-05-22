import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Category } from '../../shared/models/categoryModel';
import { environmentDev1 } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CaService {
  private http = inject(HttpClient);
  private api = `${environmentDev1.apiUrl}/category`;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.api).pipe(
      tap(categories => console.log('Categorías obtenidas:', categories))
    );
  }
}
