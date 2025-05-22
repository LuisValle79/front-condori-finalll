// purchase-detail-item.component.ts
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importaciones de Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Modelos
import { Detail } from '../../../../shared/models/BuyDetailModel';
import { Product } from '../../../../shared/models/productModel';

// Servicios
import { ApiService } from '../../../../core/service/product.service';

/**
 * Componente para mostrar un ítem de detalle de compra
 * Permite editar o eliminar un detalle específico
 */
@Component({
  selector: 'app-purchase-detail-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './purchase-detail-item.component.html',
  styleUrls: ['./purchase-detail-item.component.css']
})
export class PurchaseDetailItemComponent {
  // Propiedades de entrada y salida
  @Input() detail!: Detail;
  @Output() remove = new EventEmitter<Detail>();
  @Output() edit = new EventEmitter<Detail>();
  
  // Propiedades del componente
  productName: string = '';

  /**
   * Constructor del componente
   * @param apiService Servicio para obtener información de productos
   */
  constructor(private apiService: ApiService) { }

  /**
   * Hook del ciclo de vida - detecta cambios en las propiedades de entrada
   * Se ejecuta cuando cambia el detalle de entrada
   * @param changes Cambios detectados en las propiedades de entrada
   */
  ngOnChanges(changes: SimpleChanges): void {
    console.log("probando comercialname");
    this.loadProductName();
  }

  /**
   * Carga el nombre del producto desde el servicio API
   * Utiliza el ID del producto del detalle para obtener su información
   */
  loadProductName(): void {
    this.apiService.getProductById(this.detail.productId).subscribe({
      next: (product: Product) => {
        this.productName = product.comercialName || product.comercialName;
        console.log(this.productName);
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        this.productName = 'Producto no encontrado';
      }
    });
  }

  /**
   * Maneja el evento de eliminación del detalle
   * Emite el detalle actual para que el componente padre lo elimine
   */
  onRemove(): void {
    this.remove.emit(this.detail);
  }

  /**
   * Maneja el evento de edición del detalle
   * Emite el detalle actual para que el componente padre lo cargue en el formulario
   */
  onEdit(): void {
    // Emitimos el objeto detail actual para que se cargue en el formulario
    this.edit.emit(this.detail);
    console.log(this.detail);
  }
}