import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Detail } from '../../../../shared/models/BuyDetailModel';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/service/product.service';
import { Product } from '../../../../shared/models/productModel';

@Component({
  selector: 'app-purchase-detail-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './purchase-detail-item.component.html',
  styleUrls: ['./purchase-detail-item.component.css']
})
export class PurchaseDetailItemComponent {
  @Input() detail!: Detail;
  @Output() remove = new EventEmitter<void>();

  productName: string = '';

  constructor(private apiService: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log("probando comercialname")
    this.loadProductName();
  }

  loadProductName(): void {
    
      this.apiService.getProductById(this.detail.productId).subscribe({
        next: (product: Product) => {
          this.productName = product.comercialName || product.comercialName;
          console.log(this.productName)
        },
        error: (err) => {
          console.error('Error al cargar producto:', err);
          this.productName = 'Producto no encontrado';
        }
      });
    }
  }
  
