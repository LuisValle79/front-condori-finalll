import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/service/product.service';
import { SuService } from '../../../core/service/supplier.service';
import { CroService } from '../../../core/service/crops.service';
import Swal from 'sweetalert2';
import { Product } from '../../../shared/models/productModel';
import { Supplier } from '../../../shared/models/supplierModel';
import { Category } from '../../../shared/models/categoryModel';
import { crop } from '../../../shared/models/cropsModel';
import { CaService } from '../../../core/service/category.service';
import { RouterModule } from '@angular/router';
import { productCreated } from '../../../shared/models/productModelEditCreate';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChip, MatChipSet, MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule, MatNavList } from '@angular/material/list';
import { MatOption } from '@angular/material/core';


@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDialogModule,
    MatListModule,
  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductFormComponent implements OnInit {
  isEditMode = false;
  productId: number | null = null;
  mostrarFormulario = true;
  searchTerm: string = '';
  filteredSuppliers: any[] = [];
  filteredCategorias: any[] = [];
  filteredCrops: any[] = [];
  stockInvalid: boolean = false;



  validateStock(): void {
  if (this.product.stock <0) {
    this.product.stock = 0;
    this.stockInvalid = true;
  } else {
    this.stockInvalid = false;
  }
}


  // Objeto para almacenar los datos del producto
  product: Product = {
    id: 0,
    comercialName: '',

    formulation: '',
    brand: '',

    salePrice: 0,
    unit: '',
    status: 'A',
    concentration: 0.0,
    concentrationUnit: '',

    stock: 0,
    barCode: '',
    supplier: { id: 0, name: '', phone: '', email: '', ruc: '', status: '' },
    category: { id: 0, categoryName: '' },
    crop: { id: 0, name: '', createAt: '' }
  };

  suppliers: Supplier[] = [];
  categories: Category[] = [];
  crop: crop[] = [];

  @Output() productSaved = new EventEmitter<Product>();
  supplierId: number | undefined;
  categoryId: number | undefined;
  cropId: number | undefined;

  mostrarModalProveedor: boolean = false;
  mostrarModalCategoria: boolean = false;
  mostrarModalCultivo: boolean = false;
  editingSupplier = false;
  previousSupplier: any;

  constructor(
    private apiService: ApiService,
    private suService: SuService,
    private caService: CaService,
    private croService: CroService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.productId = this.route.snapshot.params['id'];
    this.isEditMode = !!this.productId;

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
      this.filteredSuppliers = [...this.suppliers];
      console.log(this.product);
    }
    console.log(this.product);
    this.loadSuppliers();
    this.loadCategories();
    this.loadCrops();
    


    
  }

  formatDecimalPrice() {
    // Aseguramos que el valor siempre tenga dos decimales, incluso si es entero
    if (this.product.salePrice && !isNaN(this.product.salePrice)) {
      this.product.salePrice = parseFloat(this.product.salePrice.toFixed(2));
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.router.navigate(['/productos']);
  }

  loadProduct(id: number): void {
    this.apiService.getProductById(id).subscribe({
      next: (data) => {
        this.product = data;
        this.supplierId = this.product.supplier?.id ?? undefined;
        this.categoryId = this.product.category?.id ?? undefined;
        this.cropId = this.product.crop?.id ?? undefined;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        Swal.fire('Error', 'No se pudo cargar el producto', 'error');
      }
    });
  }

  loadSuppliers(): void {
    this.suService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filteredSuppliers = data;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
      }
    });
  }

  loadCategories(): void {
    this.caService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.filteredCategorias = data;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  loadCrops(): void {
    this.croService.getCrops().subscribe({
      next: (data) => {
        this.crop = data;
        this.filteredCrops = data;
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
      }
    });
  }

  filterSuppliers() {
    if (!this.searchTerm.trim()) {
      // Si no hay término de búsqueda, mostrar todos los proveedores
      this.filteredSuppliers = this.suppliers;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredSuppliers = this.suppliers.filter(supplier =>
      supplier.name?.toLowerCase().includes(term)
    );
    console.log(`Resultados de búsqueda para "${this.searchTerm}":`, this.filteredSuppliers);
    console.log(`Se encontraron ${this.filteredSuppliers.length} proveedores`);
  }

  filterCategorias() {
    if (!this.searchTerm.trim()) {
      // Si no hay término de búsqueda, mostrar todas las categorías
      this.filteredCategorias = this.categories;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredCategorias = this.categories.filter(categories =>
      categories.categoryName?.toLowerCase().includes(term)
    );
    console.log(`Resultados de búsqueda para "${this.searchTerm}":`, this.filteredCategorias);
    console.log(`Se encontraron ${this.filteredCategorias.length} categorias`);
  }

  filterCrops() {
    if (!this.searchTerm.trim()) {
      // Si no hay término de búsqueda, mostrar todos los cultivos
      this.filteredCrops = this.crop;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredCrops = this.crop.filter(crop =>
      crop.name?.toLowerCase().includes(term)
    );
    console.log(`Resultados de búsqueda para "${this.searchTerm}":`, this.filteredCrops);
    console.log(`Se encontraron ${this.filteredCrops.length} cultivos`);
  }

  onSubmit(): void {
    // Validaciones comunes
    if (!this.validateForm()) {
      return;
    }

    // Crear el objeto productCreated para ambos escenarios (crear y actualizar)
    const productData: productCreated = {
      id: this.isEditMode ? this.product.id : 0,
      comercialName: this.product.comercialName,
      formulation: this.product.formulation,
      brand: this.product.brand,
      salePrice: this.product.salePrice,
      unit: this.product.unit,
      status: this.product.status,
      concentration: this.product.concentration,
      concentrationUnit: this.product.concentrationUnit,
      stock: this.product.stock,
      barCode: this.product.barCode,
      supplierId: this.product.supplier.id,
      categoryId: this.product.category.id,
      cropId: this.product.crop?.id
    };



    if (this.isEditMode && this.productId) {
      this.updateProduct(productData);
    } else {
      this.createProduct(productData);
    }
  }

  private validateForm(): boolean {
    if (
      !this.product.comercialName ||
      !this.product.formulation ||
      !this.product.brand ||
      !this.product.salePrice ||
      !this.product.unit ||
      !(this.product.supplier && this.product.supplier.id) ||  // Validación segura
      !(this.product.category && this.product.category.id) ||  // Validación segura
      !(this.product.crop && this.product.crop.id)             // Validación segura
    ) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, completa todos los campos obligatorios.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return false;
    }



    if (this.product.salePrice <= 0) {
      Swal.fire({
        title: 'Error',
        text: 'El precio de venta debe ser un número positivo.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return false;
    }

    if (this.product.stock < 0) {
      Swal.fire({
        title: 'Error',
        text: 'El stock no puede ser un número negativo.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return false;
    }

    return true;
  }


onlyNumbers(event: KeyboardEvent): void {
  const charCode = event.charCode || event.keyCode;

  // Permitir sólo dígitos (códigos 48 a 57 en ASCII)
  if (charCode < 48 || charCode > 57) {
    event.preventDefault();
  }
}

limitBarcodeLength(): void {
  if (this.product.barCode) {
    // Eliminar caracteres no numéricos, por si acaso
    this.product.barCode = this.product.barCode.replace(/\D/g, '');

    // Limitar a 13 caracteres
    if (this.product.barCode.length > 13) {
      this.product.barCode = this.product.barCode.slice(0, 13);
    }
  }
}

  
  private createProduct(product: productCreated): void {
    console.log("Creando producto:", product);

    this.apiService.createProduct(product).subscribe({
      next: (response) => {
        // Registra la respuesta directamente en la consola
        console.log('Respuesta del servidor:', response);

        // Mostrar mensaje de éxito sin intentar parsear
        Swal.fire({
          title: '¡Éxito!',
          text: response, // Usa directamente el texto recibido del backend
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.productSaved.emit(); // Emitir evento sin datos adicionales
          this.resetForm();
          this.router.navigate(['/products']);
        });
      },
      error: (error) => {
        // Manejo de errores en caso de fallo
        console.error('Error al crear producto:', error);

        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al crear el producto.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  seleccionarProveedor(supplier: Supplier): void {
    this.product.supplier = supplier;
    this.supplierId = supplier.id;
    this.mostrarModalProveedor = false;
  }

  seleccionarCategoria(category: Category): void {
    this.product.category = category;
    this.categoryId = category.id;
    this.mostrarModalCategoria = false;
  }

  seleccionarCultivo(crop: crop): void {
    this.product.crop = crop;
    this.cropId = crop.id;
    this.mostrarModalCultivo = false;
  }

  private updateProduct(productData: productCreated): void {
    if (!this.productId) return;

    this.apiService.updateProduct(this.productId, productData).subscribe({
      next: (updatedProduct) => {
        console.log('Producto actualizado:', updatedProduct);
        Swal.fire({
          title: '¡Éxito!',
          text: 'El producto se ha actualizado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.productSaved.emit(); // Usar el nuevo nombre de evento
          this.router.navigate(['/products']);
        });
      },
      error: (error) => {
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al actualizar el producto.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        console.error('Error al actualizar producto:', error);
      }
    });
  }

  resetForm(): void {
    this.product = {
      id: 0,
      comercialName: '',
      genericName: '',
      formulation: '',
      brand: '',
      description: '',
      salePrice: 0,
      unit: '',
      status: 'A',
      concentration: 0.0,
      concentrationUnit: '',
      actionMode: '',
      pestsDiseases: '',
      recomendedDose: '',
      precautions: '',
      stock: 0,
      barCode: '',
      supplier: { id: 0, name: '', phone: '', email: '', ruc: '', status: '' },
      category: { id: 0, categoryName: '' },
      crop: { id: 0, name: '', createAt: '' }
    };
  }
}