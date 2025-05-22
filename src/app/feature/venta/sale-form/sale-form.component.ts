import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SaleService } from '../../../core/service/sale.service';
import { SaleDetailService } from '../../../core/service/sale-detail.service';
import { CustomerService } from '../../../core/service/cliente.service';
import { ApiService } from '../../../core/service/product.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

interface SaleDetail {
  saleDetailsId?: number;
  quantity: number;
  salePrice: number;
  amountDetail: number;
  saleId: number;
  productId: number;
}

interface Customer {
  customerId: number;
  firstName: string;
  lastName: string;
}

interface Product {
  id: number;
  comercialName: string;
  formulation: string;
  brand: string;
  salePrice: number;
  unit: string;
  status: string;
  concentration: number;
  concentrationUnit: string;
  stock: number;
  barCode: string;
  supplier: any;
  category: any;
  crop?: any;
}

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.css']
})
export class SaleFormComponent implements OnInit {
  saleForm!: FormGroup;
  customers: Customer[] = []; // Tipado correcto
  products: Product[] = []; // Tipado correcto
  
  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private saleDetailService: SaleDetailService,
    private customerService: CustomerService,
    private productService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.loadCustomers();
    this.loadProducts();
  }

  createForm() {
    this.saleForm = this.fb.group({
      customerId: ['', Validators.required],
      saleDate: [new Date(), Validators.required],
      total: [0, [Validators.required, Validators.min(0)]],
      details: this.fb.array([])
    });

    // Suscribirse a cambios en los detalles para actualizar el total
    this.details.valueChanges.subscribe(() => {
      this.updateTotal();
    });
  }

  get details() {
    return this.saleForm.get('details') as FormArray;
  }

  addDetail() {
    const detailForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      salePrice: [0, Validators.required],
      amountDetail: [0]
    });

    detailForm.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateDetailAmount(this.details.length);
      this.updateTotal();
    });

    this.details.push(detailForm);
  }

  removeDetail(index: number) {
    this.details.removeAt(index);
    this.updateTotal();
  }

  onProductSelect(event: any, index: number) {
    const selectedProductId = event.value;
    const selectedProduct = this.products.find(p => p.id === selectedProductId);

    if (selectedProduct) {
      const detailGroup = this.details.at(index);
      detailGroup.patchValue({
        salePrice: selectedProduct.salePrice
      });
      this.calculateDetailAmount(index);
      this.updateTotal();
    }
  }

  private calculateDetailAmount(index: number) {
    const detail = this.details.at(index);
    const quantity = detail.get('quantity')?.value || 0;
    const salePrice = detail.get('salePrice')?.value || 0;
    const amount = quantity * salePrice;
    detail.patchValue({ amountDetail: amount }, { emitEvent: false });
  }

  private updateTotal() {
    const total = this.details.controls.reduce((sum, control) => {
      return sum + (control.get('amountDetail')?.value || 0);
    }, 0);
    this.saleForm.patchValue({ total: total });
  }

  onSubmit() {
    if (this.saleForm.valid && this.details.length > 0) {
      const stockValidation = this.validateStock();
      if (!stockValidation.valid) {
        Swal.fire({
          icon: 'error',
          title: 'Error de Stock',
          text: stockValidation.message
        });
        return;
      }

      Swal.fire({
        title: 'Procesando venta...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const saleData = {
        customerId: this.saleForm.get('customerId')?.value,
        total: this.saleForm.get('total')?.value,
        saleDate: new Date().toISOString()
      };

      this.saleService.createSale(saleData).subscribe({
        next: (response) => {
          const createDetails = async () => {
            try {
              for (const control of this.details.controls) {
                const detailData: SaleDetail = {
                  quantity: Number(control.get('quantity')?.value),
                  salePrice: Number(control.get('salePrice')?.value),
                  amountDetail: Number(control.get('amountDetail')?.value),
                  saleId: Number(response.saleId),
                  productId: Number(control.get('productId')?.value)
                };
                
                await firstValueFrom(this.saleDetailService.createSaleDetail(detailData));
              }
              
              Swal.fire({
                icon: 'success',
                title: '¡Venta registrada!',
                text: 'La venta y sus detalles se han guardado correctamente',
                confirmButtonText: 'Aceptar'
              }).then(() => {
                this.router.navigate(['/ventas']);
              });
            } catch (error) {
              console.error('Error al crear los detalles:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al guardar los detalles de la venta',
                confirmButtonText: 'Aceptar'
              });
            }
          };

          createDetails();
        },
        error: (error) => {
          console.error('Error al crear la venta:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo crear la venta',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    }
  }

  private validateStock(): { valid: boolean, message: string } {
    for (const control of this.details.controls) {
        const productId = control.get('productId')?.value;
        const quantity = control.get('quantity')?.value;
        const product = this.products.find(p => p.id === productId);
        
        if (product && quantity > product.stock) {
            return {
                valid: false,
                message: `Stock insuficiente para ${product.comercialName}. Stock disponible: ${product.stock}`
            };
        }
    }
    return { valid: true, message: '' };
}

  loadCustomers() {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
        this.snackBar.open('Error al cargar los clientes', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.products = response.filter((product: Product) => 
             
            product.stock > 0
          );
        } else {
          console.error('La respuesta no es un array:', response);
          this.snackBar.open('Formato de datos inválido', 'Cerrar', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        this.snackBar.open('Error al cargar los productos', 'Cerrar', { duration: 3000 });
      }
    });
  }
  

  

  cancel() {
    this.router.navigate(['/ventas']);
  }
}

