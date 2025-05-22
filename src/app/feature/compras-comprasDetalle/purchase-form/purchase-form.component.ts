// purchase-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

// Importaciones de Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

// Módulos Comunes
import { CommonModule } from '@angular/common';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';

// Componentes Personalizados
import { PurchaseDetailFormComponent } from './purchase-detail-form/purchase-detail-form.component';
import { PurchaseDetailItemComponent } from './purchase-detail-item/purchase-detail-item.component';

// Modelos
import { Buy, buyEdit } from '../../../shared/models/buyModel';
import { Detail } from '../../../shared/models/BuyDetailModel';
import { Supplier } from '../../../shared/models/supplierModel';

// Servicios
import { BuyService } from '../../../core/service/compra.service';
import { SuService } from '../../../core/service/supplier.service';
import { BuyDetailService } from '../../../core/service/Cdetail.service';


/**
 * Componente para gestionar formularios de compra
 * Maneja tanto la creación como la edición de compras con sus detalles
 */
@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.css'],
  imports: [
    MatTableModule, 
    MatDatepickerModule, 
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule, 
    MatOptionModule, 
    MatSelectModule,
    
    // Angular Core
    CommonModule,
    ReactiveFormsModule,
    
    // Componentes Personalizados
    PurchaseDetailFormComponent,
    PurchaseDetailItemComponent,
    
    // Librerías de terceros
    DatePickerModule
  ],
})
export class PurchaseFormComponent implements OnInit {
  // Propiedades del formulario y datos
  purchaseForm: FormGroup;
  details: Detail[] = [];
  suppliers: Supplier[] | undefined;
  deletedDetailIds: number[] = [];
  
  // Gestión de estado
  isEditMode = false;
  purchaseId: number | null = null;
  isLoading: boolean | undefined;
  currentEditDetail: Detail | null = null;

  /**
   * Constructor del componente
   * Inicializa servicios y formulario
   */
  constructor(
    private fb: FormBuilder,
    private BuyService: BuyService,
    private supplierService: SuService,
    private BuyDetailService: BuyDetailService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Inicializa el formulario de compra con validación
    this.purchaseForm = this.fb.group({
      buysDate: ['', Validators.required],
      supplierId: ['', Validators.required],
      invoiceNumber: ['', Validators.required],
      buysPrice: [0, [Validators.required, Validators.min(0.01)]],
    });
  }

  /**
   * Hook del ciclo de vida - inicialización del componente
   * Carga proveedores y verifica si está en modo edición
   */
  ngOnInit(): void {
    this.loadSuppliers();

    // Verifica si estamos en modo edición buscando un parámetro ID en la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.purchaseId = +params['id']; // Convierte a número
        this.isEditMode = true;
        this.loadPurchaseData(this.purchaseId);
      }
    });
  }

  /**
   * Carga todos los proveedores para el desplegable
   */
  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        console.log('Proveedores cargados:', this.suppliers);
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        // Muestra mensaje de error al usuario
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los proveedores.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  /**
   * Carga los datos de la compra cuando está en modo edición
   * @param id ID de la compra a cargar
   */
  loadPurchaseData(id: number): void {
    // Muestra indicador de carga
    Swal.fire({
      title: 'Cargando datos...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Carga los datos de la compra
    this.BuyService.getBuyById(id).subscribe({
      next: (purchase: buyEdit) => {
        console.log('Datos recibidos de la compra:', purchase);

        // Convierte la fecha del formato DD/MM/YYYY al formato YYYY-MM-DD
        let formattedDate = '';
        if (purchase.buysDate) {
          // Si la fecha viene como DD/MM/YYYY
          const dateParts = purchase.buysDate.toString().split('/');
          if (dateParts.length === 3) {
            // Formato DD/MM/YYYY -> YYYY-MM-DD
            formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
          } else {
            // En caso de que la fecha ya esté en otro formato
            formattedDate = new Date(purchase.buysDate).toISOString().split('T')[0];
          }
        }

        console.log('Fecha formateada para el formulario:', formattedDate);

        // Actualiza el formulario con los datos de la compra - usando los nombres correctos que vienen de la API
        this.purchaseForm.patchValue({
          buysDate: formattedDate,
          supplierId: purchase.supplier?.id, // Obtenemos el ID del proveedor del objeto supplier
          invoiceNumber: purchase.invoiceNumber,
          buysPrice: purchase.buysPrice // Usar buysPrice en lugar de price
        });

        console.log('Formulario actualizado con valores:', this.purchaseForm.value);

        // Carga los detalles de la compra
        this.loadPurchaseDetails(id);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading purchase:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar los datos de la compra.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  /**
   * Carga los detalles de una compra específica
   * @param buyId ID de la compra para cargar sus detalles
   */
  loadPurchaseDetails(buyId: number): void {
    this.BuyDetailService.getDetailsByBuyId(buyId).subscribe({
      next: (details: Detail[]) => {
        this.details = details;
        Swal.close(); // Cierra el indicador de carga
      },
      error: (error) => {
        console.error('Error loading purchase details:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar los detalles de la compra.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  /**
   * Añade un nuevo detalle a la compra
   * @param detail Detalle a añadir
   */
  addDetail(detail: Detail): void {
    this.details = [...this.details, detail];
    this.updateTotal();
  }

  /**
   * Elimina un detalle de la compra
   * Si el detalle tiene un ID, se añade a deletedDetailIds para procesamiento en el backend
   * @param detail Detalle a eliminar
   */
  onRemoveDetail(detail: Detail) {
    console.log('Detalle recibido:', detail);

    if ((detail as any).buyDetailId) {
      this.deletedDetailIds.push((detail as any).buyDetailId);
    }

    this.details = this.details.filter(d => d !== detail);

    console.log('IDs eliminados:', this.deletedDetailIds);
    this.updateTotal();
  }

  /**
   * Actualiza el precio total de la compra basado en todos los detalles
   */
  private updateTotal(): void {
    const buysPrice = this.details.reduce((sum, item) => sum + item.totalDetail, 0);
    this.purchaseForm.patchValue({ buysPrice });
  }

  /**
   * Maneja el envío del formulario
   * Valida el formulario y los detalles antes de procesar
   */
  onSubmit(): void {
    if (this.purchaseForm.valid && this.details.length > 0) {
      const purchase: Buy = {
        ...this.purchaseForm.value
      };
      const purchaseEdit: buyEdit = {
        ...this.purchaseForm.value,
        buysId: this.purchaseId
      };
      console.log(purchaseEdit);

      // Si está en modo edición, añade el ID al objeto de compra
      if (this.isEditMode && this.purchaseId) {
        purchase.buysId = this.purchaseId;
      }

      // Muestra indicador de carga
      Swal.fire({
        title: this.isEditMode ? 'Actualizando compra...' : 'Procesando compra...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      if (this.isEditMode) {
        this.updatePurchase(purchaseEdit);
      } else {
        this.createPurchase(purchase);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Revisa los campos e intenta nuevamente.',
        confirmButtonColor: '#f0ad4e'
      });
    }
  }

  /**
   * Crea una nueva compra
   * @param purchase Datos de la compra a crear
   */
  createPurchase(purchase: Buy): void {
    this.BuyService.createBuy(purchase).subscribe({
      next: (response) => {
        const buyId = response.buysId;
        console.log(buyId);
        this.savePurchaseDetails(buyId, 'Compra registrada', 'La compra y sus detalles fueron guardados correctamente');
      },
      error: (error) => {
        this.handleError('Error creando compra', error);
      }
    });
  }

  /**
   * Actualiza una compra existente y sus detalles
   * Maneja la creación de nuevos detalles, actualización de existentes y desactivación de eliminados
   * @param purchase Datos de la compra a actualizar
   */
  updatePurchase(purchase: buyEdit): void {
    this.BuyService.updateBuy(purchase).subscribe({
      next: () => {
        if (!this.purchaseId) return;

        const buyId = this.purchaseId;
        const details = this.details || [];

        // Detalles con ID (existentes) y sin ID (nuevos)
        const detailsToUpdate = details.filter(d => d.buyDetailId && !this.deletedDetailIds.includes(d.buyDetailId));
        const detailsToCreate = details.filter(d => !d.buyDetailId);

        // IDs de detalles que deben permanecer activos (los que actualizamos)
        const detailIdsToKeep = detailsToUpdate.map(d => d.buyDetailId);

        // Peticiones para actualizar detalles existentes que no se eliminaron
        const updateRequests = detailsToUpdate.map(detail => this.BuyDetailService.updateBuyDetail(detail));

        // Peticiones para crear nuevos detalles
        const createRequests = detailsToCreate.map(detail => {
          detail.buyId = buyId;
          return this.BuyDetailService.createBuyDetail(detail);
        });

        // Peticiones para desactivar detalles eliminados
        const deactivateRequests = this.deletedDetailIds.length > 0 
          ? this.deletedDetailIds.map(id => this.BuyDetailService.deactivateBuyDetailById(id))
          : [];

        console.log(deactivateRequests);

        // Ejecutar todas las peticiones en paralelo: actualizar, crear y desactivar
        forkJoin([...updateRequests, ...createRequests, ...deactivateRequests]).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Compra actualizada',
              text: 'La compra y sus detalles fueron actualizados correctamente',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'OK'
            }).then(() => {
              this.router.navigate(['/compras']);
            });
          },
          error: (error) => this.handleError('Error procesando detalles', error)
        });
      },
      error: (error) => this.handleError('Error actualizando compra', error)
    });
  }

  /**
   * Guarda los detalles de una nueva compra
   * @param buyId ID de la compra para asociar los detalles
   * @param successTitle Título para el mensaje de éxito
   * @param successMessage Texto para el mensaje de éxito
   */
  savePurchaseDetails(buyId: number, successTitle: string, successMessage: string): void {
    console.log("creando detalles - id de compra : ", buyId);
    const createDetails = this.details.map((detail) => {
      // Asegúrate de que el ID del detalle sea nulo para que se cree como nuevo
      const detailToCreate = { ...detail, buyId: buyId };

      return this.BuyDetailService.createBuyDetail(detailToCreate).toPromise();
    });

    // Espera a que todos los detalles sean creados
    Promise.all(createDetails)
      .then((results) => {
        Swal.fire({
          icon: 'success',
          title: successTitle,
          text: successMessage,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        }).then(() => {
          // Navega de vuelta a la lista de compras
          this.router.navigate(['/compras']);
        });

        console.log('Compra y detalles procesados:', { buyId, results });
      })
      .catch((error) => {
        this.handleError('Error guardando detalles', error);
      });
  }

  /**
   * Manejador genérico de errores para llamadas a la API
   * @param title Título del error
   * @param error Objeto de error
   */
  handleError(title: string, error: any): void {
    console.error(`${title}:`, error);
    Swal.fire({
      icon: 'error',
      title: title,
      text: 'Ocurrió un error. Inténtalo de nuevo.',
      confirmButtonColor: '#d33'
    });
  }

  /**
   * Actualiza un detalle existente
   * @param updatedDetail Detalle con valores actualizados
   */
  updateDetail(updatedDetail: Detail): void {
    console.log('Actualizando detalle:', updatedDetail);
  
    // Encuentra el índice del detalle que se está actualizando
    const index = this.details.findIndex(d => d.buyDetailId === updatedDetail.buyDetailId);
    
    if (index !== -1) {
      // Reemplaza el detalle antiguo con el actualizado
      this.details[index] = updatedDetail;
    }
    
    // Actualiza el total
    this.updateTotal();
    
    // Resetea el detalle actual
    this.currentEditDetail = null;
  }

  /**
   * Establece un detalle para edición
   * @param detail Detalle a editar
   */
  onEditDetail(detail: Detail): void {
    console.log('Editando detalle:', detail);
    this.currentEditDetail = detail;
  }

  // Método de marcador de posición no utilizado (mantenido por compatibilidad)
  handleProducts(arg0: string, products: any) {
    throw new Error('Method not implemented.');
  }
}