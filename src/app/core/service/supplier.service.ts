import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../../shared/models/supplierModel';
import { environmentDev1 } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SuService {
  private http = inject(HttpClient);
  private api = `${environmentDev1.apiUrl}/suppliers`;

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.api);
  }
}
