import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';


import { Product } from '../../../shared/models/productModel';
import { ApiService } from '../../../core/service/product.service';
import { CaService } from '../../../core/service/category.service';
import Swal from 'sweetalert2';
import { ProductDetailsDialogComponent } from '../product-details/dialog.component';
import { WebSocketService } from '../../../core/service/websocket.service';




@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

  ],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductList implements OnInit {

  debugMode = true;
  // Datos y estado
  product: Product[] = [];
  filteredProducts: Product[] = [];
  categories: any[] = [];

  showDetailsModal: boolean = false;
  detailsModalRef?: MatDialogRef<any>;


  // Filtros
  searchTerm: string = '';
  categoryFilter: string = '';
  lowStockOnly: boolean = false;
  inactiveOnly: boolean = false;

  // Vista
  showCreateForm: boolean = false;
  showlis: boolean = true;
  viewMode: 'compact' | 'detailed' = 'compact';

  // Paginación
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  totalFilteredProducts: number = 0;

  // Selección
  selectedProduct: number | undefined = undefined;
  selectedProductForDetails: Product | null = null;
  isEditing: boolean = false;
  loadingInactive: boolean = false; // Variable para controlar el spinner de carga
  Math: any;

  constructor(

    private productService: ApiService,
    private router: Router,
    private ca: CaService,
    private dialog: MatDialog,
    private webSocketService: WebSocketService 


  ) { }

  ngOnInit(): void {
    this.Math = Math;

    // Conectar al WebSocket
  this.webSocketService.connect();

  // Suscribirse a productos actualizados
  this.webSocketService.productUpdates$.subscribe((updatedProduct: Product) => {
    console.log('Producto recibido por WebSocket:', updatedProduct);
    this.updateProductList(updatedProduct);
  });

    if (this.inactiveOnly) {
      this.loading = true;
      this.loadProductsByInactive();
      this.loading = false;
    } else {
      this.listProducts();
    }
  }

  loading = false;

  // Métodos de carga de datos
  listProducts(): void {
    this.loading = true;
    console.log("cargando productos.....")
    this.productService.getProducts().subscribe({
      next: (data) => {
        // Ordenamos los productos alfabéticamente por nombre (ajusta la propiedad si es necesario)
        this.product = data.sort((a, b) => {
          if (a.comercialName.toLowerCase() < b.comercialName.toLowerCase()) {
            return -1;
          }
          if (a.comercialName.toLowerCase() > b.comercialName.toLowerCase()) {
            return 1;
          }
          return 0;
        });

        // Filtramos los productos y extraemos las categorías
        this.filterProducts();
        this.extractCategories();
        this.loading = false;
      },

      error: (error) => {
        console.error('Error al obtener productos:', error);
        this.loading = false;
      }
  })
  }


  loadProductsByInactive(): void {
    this.loading = true;
    this.productService.getProductsByInactive().subscribe({
      next: (data) => {
        this.product = data;
        this.filterProducts();
        this.extractCategories();
        this.loadingInactive = false;
        console.log(data)// Desactivar spinner
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.ca.getCategories().subscribe({
      next: (response) => this.categories = response,
      error: (error) => console.error('Error al cargar categorías:', error)
    });
  }

  extractCategories(): void {
    setTimeout(() => {
      if (this.product?.length > 0) {
        const uniqueCategories = new Map();
        this.product.forEach(p => {
          if (p.category && !uniqueCategories.has(p.category.id)) {
            uniqueCategories.set(p.category.id, p.category);
          }
        });
        this.categories = Array.from(uniqueCategories.values());
      }
    }, 500);
  }

  filterProducts(): void {
    const allFilteredProducts = this.product.filter(product => {
      const searchMatch = !this.searchTerm ||
        [product.comercialName, product.brand,
        product.barCode, product.formulation]
          .some(field => field?.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const categoryMatch = !this.categoryFilter ||
        product.category?.id === Number(this.categoryFilter);
      console.log(this.categoryFilter, product.category?.id?.toString())

      const stockMatch = !this.lowStockOnly || (product.stock ?? 0) < 10;

      // Aquí registramos valores para depuración
      console.log('Categoría seleccionada (categoryFilter):', this.categoryFilter);
      console.log('Categoría del producto:', product.category?.categoryName);
      console.log('Coincidencia de categoría (categoryMatch):', categoryMatch);

      return searchMatch && categoryMatch && stockMatch;
    });

    // Mostrar los productos que han pasado los filtros
    console.log('Productos después del filtrado:', allFilteredProducts);

    this.totalFilteredProducts = allFilteredProducts.length;
    this.calculateTotalPages();

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredProducts = allFilteredProducts.slice(startIndex, endIndex);

    // Mostrar los productos que se mostrarán en la página actual
    console.log('Productos paginados (filteredProducts):', this.filteredProducts);
  }




  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.filterProducts();
  }

  // Métodos de UI
  async toggleInactiveFilter(): Promise<void> {
    this.loadingInactive = true;
    // Activar spinner

    try {
      this.inactiveOnly = !this.inactiveOnly;

      if (this.inactiveOnly) {

        // Activar spinner
        this.loadProductsByInactive();
        await new Promise(resolve => setTimeout(resolve, 4000));
        // Desactivar spinner

        // Debe ser una Promise
      } else {

        this.listProducts();
        await new Promise(resolve => setTimeout(resolve, 4000));// También debe ser una Promise
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      this.loadingInactive = false; // Desactivar spinner
    }
  }
  resetFilters(): void {
    this.searchTerm = '';
    this.categoryFilter = '';
    this.lowStockOnly = false;
    this.inactiveOnly = false;
    this.filterProducts();
    this.listProducts();
  }

  setViewMode(mode: 'compact' | 'detailed'): void {
    this.viewMode = mode;
  }

  openDetailsDialog(product: Product): void {
    this.dialog.open(ProductDetailsDialogComponent, {
      width: '800px',
      data: { product }
    });
  }

  // Métodos CRUD
  editProduct(product: Product): void {
    this.router.navigate(['/productos/editar', product.id]);
  }

  changeProductStatus(product: Product, newStatus: 'A' | 'I'): void {
    const actionText = newStatus === 'A' ? 'activar' : 'eliminar';
    const confirmButton = newStatus === 'A' ? 'Sí, activar' : 'Sí, eliminar';
    const successTitle = newStatus === 'A' ? '¡Producto activado!' : '¡Producto eliminado!';

    Swal.fire({
      title: `¿Estás seguro?`,
      text: `Este producto será marcado como ${newStatus === 'A' ? 'activo' : 'inactivo'}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmButton,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      backdrop: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.updateProductStatus(product.id, newStatus).subscribe({
          next: (response) => {
            product.status = newStatus;
            Swal.fire({
              title: successTitle,
              text: 'El estado ha sido actualizado.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
              backdrop: false
            });

            if (newStatus === 'A') {
              this.loadProductsByInactive();
            } else {
              this.listProducts();
            }
          },
          error: (error) => {
            console.error('Error al actualizar el estado:', error);
            Swal.fire('Error', 'Hubo un problema al actualizar el producto.', 'error');
          }
        });
      }
    });
  }

  // Métodos auxiliares
  onProductCreated(newProduct: Product): void {
    this.product.push(newProduct);
    this.filterProducts();
    this.showCreateForm = false;
  }

  onProductUpdated(): void {
    this.listProducts();
  }

  closeEdit(): void {
    this.showlis = true;
    this.isEditing = false;
    this.selectedProduct = undefined;
  }

  getDisplayedColumns(): string[] {
    const baseColumns = [
      'comercialName', 'brand', 'salePrice',
      'stock', 'category', 'actions'
    ];

    if (this.viewMode === 'detailed') {
      return [...baseColumns.slice(0, -1), 'formulation', 'supplier', 'actions'];
    }
    return baseColumns;
  }
  // Métodos de paginación
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalFilteredProducts / this.pageSize);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  /**
   * Nuevo método para obtener números de página con elipsis
   */
  getVisiblePageNumbers(): (number | string)[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;

    // Si hay menos de 8 páginas, muestra todas
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Siempre mostraremos la primera y última página
    // y hasta 5 páginas alrededor de la página actual
    let pages: (number | string)[] = [];

    // Siempre incluir página 1
    pages.push(1);

    // Determinar rangos
    if (currentPage <= 4) {
      // Estamos cerca del inicio
      pages.push(2, 3, 4, 5);
      pages.push('ellipsis');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // Estamos cerca del final
      pages.push('ellipsis');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Estamos en el medio
      pages.push('ellipsis');
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push('ellipsis');
      pages.push(totalPages);
    }

    return pages;
  }

  /**
   * Método mejorado para cambiar de página
   */
  goToPage(pageNumber: number): void {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return; // No hacer nada si el número de página es inválido
    }
    this.currentPage = pageNumber;
    this.filterProducts();
  }

  updateProductList(updatedProduct: Product): void {
  const index = this.product.findIndex(p => p.id === updatedProduct.id);

  if (index !== -1) {
    // Actualizar producto existente
    this.product[index] = updatedProduct;
  } else {
    // Nuevo producto, agregar a la lista
    this.product.push(updatedProduct);
  }

  // Ordenar la lista alfabéticamente por nombre comercial
  this.product.sort((a, b) => a.comercialName.localeCompare(b.comercialName));

  // Volver a aplicar filtros para refrescar la lista visible
  this.filterProducts();
}

}