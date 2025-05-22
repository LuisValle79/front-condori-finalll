import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteModel } from '../../shared/models/clienteModel';
import { environmentDev2 } from '../../../environment/environment';


@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = `${environmentDev2.apiUrl}/customer`;

  constructor(private http: HttpClient) {}

  getCustomers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  
  getCustomersa(): Observable<any[]> {
    // ... existing code ...
    return this.http.get<any[]>(`${this.apiUrl}/active`);  // Modificado para obtener solo activos
  }

  getInactiveCustomers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inactive`);
  }
  createCustomer(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }
  
  updateCustomer(customerId: number, data: any): Observable<any> {
    console.log("actualizando cliente....", data)
    return this.http.put(`${this.apiUrl}/${customerId}`, data);
  }
  
  getCustomerById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  updateCustomerStatus(customerId: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${customerId}/status?status=${status}`, {});
  }
}