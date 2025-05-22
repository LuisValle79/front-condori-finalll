import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SaleDetail } from '../../shared/models/saleDetailModel';
import { environmentDev2 } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SaleDetailService {
  private http = inject(HttpClient);
  private apiUrl = `${environmentDev2.apiUrl}/saleDetail`;

  getSaleDetails(): Observable<SaleDetail[]> {
    return this.http.get<SaleDetail[]>(this.apiUrl);
  }



  getDetailsBySaleId(saleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${saleId}/details`);
  }

  

  createSaleDetail(saleDetail: SaleDetail): Observable<SaleDetail> {
    return this.http.post<SaleDetail>(this.apiUrl, saleDetail);
  }
}