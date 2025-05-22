import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Detail } from '../../shared/models/BuyDetailModel';
import { environmentDev1 } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class BuyDetailService {
  private http = inject(HttpClient);
  private apiUrl = `${environmentDev1.apiUrl}/buyDetail`;

  getBuysDetail(): Observable<Detail[]> {
    return this.http.get<Detail[]>(this.apiUrl);
  }

  getDetailsByBuyId(buyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${buyId}/details`);
  }

  createBuyDetail(buyDetail: Detail): Observable<Detail> {
    console.log("detail en el servicio, procesando: ", buyDetail);
    return this.http.post<Detail>(this.apiUrl, buyDetail);
  }

  updateBuyDetail(detail: Detail): Observable<Detail> {
    const url = `${this.apiUrl}/${detail.buyDetailId}`;
    return this.http.put<Detail>(url, detail);
  }

  deactivateBuyDetailById(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}/deactivate`;
    return this.http.put<void>(url, {});
  }

  deactivateBuyDetailsExcept(buyId: number, keepDetailIds: number[]): Observable<void> {
    const url = `${this.apiUrl}/deactivateExcept/${buyId}`;
    return this.http.put<void>(url, keepDetailIds);
  }
}