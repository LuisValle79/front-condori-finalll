// purchase-detail-form.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';

// Importaciones de Angular Material
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule, MatLabel, MatError } from '@angular/material/form-field';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

// Modelos
import { Product } from '../../../../shared/models/productModel';
import { Detail } from '../../../../shared/models/BuyDetailModel';

// Servicios
import { ApiService } from '../../../../core/service/product.service';

/**
 * Componente para gestionar el formulario de detalles de compra
 * Permite añadir nuevos detalles y editar detalles existentes
 */
@Component({
  selector: 'app-purchase-detail-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    NgIf,
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './purchase-detail-form.component.html',
  styleUrl: './purchase-detail-form.component.css'
})
export class PurchaseDetailFormComponent implements OnInit {
  // Eventos de salida para comunicación con el componente padre
  @Output() detailAdded = new EventEmitter<Detail>();
  @Output() detailUpdated = new EventEmitter<Detail>();
  
  // Entrada para recibir un detalle para editar
  @Input() set editDetail(detail: Detail | null) {
    if (detail) {
      this.loadDetailForEdit(detail);
    }
  }

  // Propiedades del componente
  products: Product[] = [];
  detailForm: FormGroup;
  selected: any;
  isEditing = false;
  editingDetailId: number = 0;

  /**
   * Constructor del componente
   * Inicializa el formulario con validaciones
   */
  constructor(
    private fb: FormBuilder,
    private ApiService: ApiService
  ) {
    // Inicializa el formulario de detalle con validaciones
    this.detailForm = this.fb.group({
      buyDetailId: [null],
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      totalDetail: [0],
      batch: ['', Validators.required],
      expireDate: ['', Validators.required],
      presentation: ['', Validators.required],
      healthRecord: ['', Validators.required],
      status: ['A'],
      buyId: [null],
    });
  }

  /**
   * Hook del ciclo de vida - inicialización del componente
   * Carga productos y configura suscripciones
   */
  ngOnInit(): void {
    this.loadProducts();

    // Actualiza automáticamente el total cuando cambian cantidad o precio unitario
    this.detailForm.valueChanges.subscribe(val => {
      if (val.quantity && val.unitPrice) {
        const total = val.quantity * val.unitPrice;
        this.detailForm.patchValue(
          {
            total: total,
            totalDetail: total
          },
          { emitEvent: false }
        );
      }
    });
  }

  /**
   * Carga la lista de productos desde el servicio
   */
  loadProducts(): void {
    this.ApiService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        console.log('Productos cargados:', this.products);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }

  /**
   * Carga los detalles del producto en el formulario para edición
   * @param detail Detalle a editar
   */
  loadDetailForEdit(detail: Detail): void {
    // Establece el modo de edición
    this.isEditing = true;

    this.editingDetailId = detail.buyDetailId;
    console.log('ID:', this.editingDetailId);

    // Busca el producto correspondiente
    const selectedProduct = this.products.find(p => p.id === Number(detail.productId));
    this.selected = selectedProduct;

    // Carga los datos en el formulario
    this.detailForm.patchValue({
      buyDetailId: detail.buyDetailId,
      productId: detail.productId,
      quantity: detail.quantity,
      unitPrice: detail.unitPrice,
      totalDetail: detail.totalDetail,
      batch: detail.batch,
      expireDate: detail.expireDate,
      presentation: detail.presentation,
      healthRecord: detail.healthRecord,
      status: detail.status || 'A'
    });

    // Desplaza la vista hacia el formulario
    document.querySelector('app-purchase-detail-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Cancela la edición y resetea el formulario
   */
  cancelEdit(): void {
    this.isEditing = false;
    this.editingDetailId = 0;
    this.resetForm();
  }

  /**
   * Resetea el formulario a sus valores iniciales
   */
  resetForm(): void {
    this.detailForm.reset({
      buyDetailId: 0,
      productId: '',
      quantity: 1,
      unitPrice: 0,
      totalDetail: 0,
      batch: '',
      expireDate: '',
      presentation: '',
      healthRecord: '',
      status: 'A'
    });
    this.selected = null;
  }

  /**
   * Maneja el evento de selección de producto
   * @param event Evento del elemento select
   */
  onProductSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const productId = target.value;

    // Encontramos el producto
    const selected = this.products.find(p => p.id === Number(productId));
    this.selected = selected;

    if (selected) {
      this.detailForm.patchValue({
        productId: selected.id,
        // Si el producto tiene valores predeterminados, podrías cargarlos aquí
      });
    }
  }

  /**
   * Añade o actualiza un detalle según el modo actual (edición o creación)
   */
  addDetail(): void {
    if (this.detailForm.valid) {
      const detail: Detail = this.detailForm.value;

      if (this.isEditing) {
        // Si está editando, emite el evento de actualización
        this.detailUpdated.emit(detail);
        console.log("Producto actualizado:", detail);
      } else {
        // Si está agregando nuevo, emite el evento de adición
        this.detailAdded.emit(detail);
        console.log("Producto agregado:", detail);
      }

      // Resetea el formulario y el modo de edición
      this.isEditing = false;
      this.editingDetailId = 0;
      this.resetForm();
    }
  }

  /**
   * Maneja el evento de envío del formulario
   */
  onSubmit(): void {
    this.addDetail();
  }
}