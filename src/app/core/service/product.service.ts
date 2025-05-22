import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Product  } from '../../shared/models/productModel';
import { productCreated } from '../../shared/models/productModelEditCreate';
import { environmentDev1 } from '../../../environment/environment';



@Injectable({
  providedIn: 'root' 
})
export class ApiService {
  
  private api  =`${environmentDev1.apiUrl}/products`;


  constructor(private http:HttpClient) { }

  getProducts():Observable<Product[]> {
    return this.http.get<Product[]>(this.api);
  }
  getProductsByInactive():Observable<Product[]> {
    return this.http.get<Product[]>(this.api + '/inactive');  
  }

  createProduct(product: productCreated): Observable<string> {
    return this.http.post(`${this.api}/Create`, product, { responseType: 'text' });
  }
  
  
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.api}/${id}`);
  }
  updateProduct(productId: number, product: productCreated): Observable<Product> {
    console.log('productos a actualziar ', product);
    return this.http.put<Product>(`${this.api}/${productId}`, product);
  }
   
  updateProductStatus(productId: number, status: string): Observable<Product> {
    const url = `${this.api}/${productId}/status?status=${status}`;
    return this.http.patch<Product>(url, {});
  }
  
  getProductsa():Observable<Product[]> {
    // ... existing code ...
    return this.http.get<Product[]>(`${this.api}/active`);  // Modificado para obtener solo activos
  }
  
  

 
}
