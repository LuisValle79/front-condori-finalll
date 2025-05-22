import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Buy, buyEdit } from '../../shared/models/buyModel';
import { environmentDev1 } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BuyService {
  private http = inject(HttpClient);
  private apiUrl = `${environmentDev1.apiUrl}/buy`;

  getBuys(): Observable<Buy[]> {
    return this.http.get<Buy[]>(this.apiUrl);
  }

  getBuyById(id: number): Observable<buyEdit> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<buyEdit>(url).pipe(
      tap((buy: buyEdit) => {
        console.log('Compra obtenida:', buy);
      })
    );
  }

  createBuy(buy: Buy): Observable<Buy> {
    console.log("Creando compra...", buy);
    return this.http.post<Buy>(this.apiUrl, buy).pipe(
      tap((response: Buy) => {
        console.log("Respuesta del backend - ID generado:", buy.buysId);
      })
    );
  }

  updateBuy(buy: buyEdit): Observable<buyEdit> {
    const url = `${this.apiUrl}/${buy.buysId}`;
    return this.http.put<buyEdit>(url, buy).pipe(
      tap((updatedBuy: buyEdit) => {
        console.log('Compra actualizada:', updatedBuy);
      })
    );
  }
}