import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sale, Sale2 } from '../../shared/models/saleModel';
import { environmentDev2 } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private http = inject(HttpClient);
  private apiUrl = `${environmentDev2.apiUrl}/sale`;

  getSales(): Observable<Sale2[]> {
    return this.http.get<Sale2[]>(this.apiUrl);
  }

  getSaleById(saleId: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.apiUrl}/${saleId}`);
  }

  createSale(sale: Sale): Observable<Sale> {
    return this.http.post<Sale>(this.apiUrl, sale);
  }
}