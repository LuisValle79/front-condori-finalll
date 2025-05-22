import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Sale, Sale2 } from '../../../shared/models/saleModel';
import { SaleService } from '../../../core/service/sale.service';
import { SaleDetailDialogComponent } from '../sale-detail-dialog/sale-detail-dialog.component';
import { CustomerService } from '../../../core/service/cliente.service';
import { SaleDetailService } from '../../../core/service/sale-detail.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import { firstValueFrom } from 'rxjs';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-sale-list',
  templateUrl: 'sale-list.component.html',  // Corregir la ruta
  styleUrls: ['sale-list.component.css'],   // Corregir la ruta
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ]
})
export class SaleListComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['saleId', 'customerName', 'saleDate', 'total', 'actions'];
  dataSource: MatTableDataSource<Sale2> = new MatTableDataSource<Sale2>();
  customers: { [key: number]: string } = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(
    private saleService: SaleService,
    private customerService: CustomerService,
    private saleDetailService: SaleDetailService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.dataSource.filterPredicate = this.createFilter();
  }

  private createFilter(): (data: any, filter: string) => boolean {
    return (data: any, filter: string) => {
      const searchStr = filter.toLowerCase();
      const clientName = `${data.customer?.name} ${data.customer?.lastName}`.toLowerCase();
      const saleId = data.saleId.toString();
      
      return clientName.includes(searchStr) || saleId.includes(searchStr);
    };
  }

  private originalData: Sale2[] = [];

  loadSales(): void {
    this.saleService.getSales().subscribe({
      next: (sales) => {
        console.log('Ventas cargadas:', sales);
        if (Array.isArray(sales)) {
          this.originalData = [...sales];
          // Ordenar las ventas por ID en orden descendente
          this.dataSource.data = sales.sort((a: any, b: any) => {
            return Number(b.saleId) - Number(a.saleId);
          });
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        } else {
          console.error('El formato de datos recibido no es un array:', sales);
          this.snackBar.open('Error en el formato de datos de ventas', 'Cerrar', {
            duration: 3000
          });
        }
      },
      error: (error) => {
        console.error('Error cargando ventas:', error);
        this.snackBar.open('Error al cargar las ventas', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  onDateFilterChange() {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      start.setHours(0, 0, 0, 0); // Establecer inicio del día
      
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999); // Establecer fin del día

      // Filtrar y ordenar los resultados
      this.dataSource.data = this.originalData
        .filter(sale => {
          const saleDate = new Date(sale.saleDate);
          saleDate.setHours(0, 0, 0, 0); // Normalizar la fecha de venta
          
          // Comparar solo las fechas sin considerar la hora
          return saleDate.getTime() >= start.getTime() && 
                 saleDate.getTime() <= end.getTime();
        })
        .sort((a: any, b: any) => {
          return Number(b.saleId) - Number(a.saleId);
        });
    } else {
      // Si no hay fechas seleccionadas, restaurar datos originales manteniendo el orden
      this.dataSource.data = [...this.originalData].sort((a: any, b: any) => {
        return Number(b.saleId) - Number(a.saleId);
      });
    }

    // Actualizar la paginación
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
}

  ngOnInit(): void {
    this.loadSales();
    this.loadCustomers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Cargar ventas desde el backend

  

  // Cargar nombres de clientes para mostrar en la tabla
  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers.reduce((acc: any, customer: any) => {
          acc[customer.id] = `${customer.name} ${customer.lastName}`;
          return acc;
        }, {});
      },
      error: (error) => {
        console.error('Error cargando clientes:', error);
        this.snackBar.open('Error al cargar clientes', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  getCustomerName(customerId: number): string {
    // Verificar si el cliente existe antes de retornar el nombre
    if (this.customers[customerId]) {
      return this.customers[customerId];
    }
    return 'Cliente no encontrado';
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewDetails(saleId: number): void {
    this.saleDetailService.getDetailsBySaleId(saleId).subscribe({
      next: (details) => {
        // Asegurarse de que los detalles incluyan la información del producto
        const formattedDetails = details.map((detail: any) => ({
          ...detail,
          product: {
            comercialName: detail.product?.comercialName || 'Producto no disponible'
          }
        }));

        this.dialog.open(SaleDetailDialogComponent, {
          width: '800px',
          data: formattedDetails,
          panelClass: 'custom-dialog-container'
        });
      },
      error: (error) => {
        console.error('Error cargando detalles:', error);
        this.snackBar.open('Error al cargar los detalles de la venta', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  createNewSale(): void {
    this.router.navigate(['/ventas/nueva']);
  }

  printSale(saleId: number): void {
    this.exportToPDF(saleId);
  }

  async exportToPDF(saleId: number): Promise<void> {
    try {
      // Obtener los detalles de la venta
      const details = await firstValueFrom(this.saleDetailService.getDetailsBySaleId(saleId));
      const sale = this.dataSource.data.find(s => s.saleId === saleId);
      
      if (!sale || !details) {
        this.snackBar.open('No se pudo generar el PDF', 'Cerrar', { duration: 3000 });
        return;
      }

      // Crear nuevo documento PDF
      const doc = new jsPDF();
      
      // Configurar fuentes y estilos
      const pageWidth = doc.internal.pageSize.getWidth();
      
      try {
        // Agregar logo
        const logoUrl = 'assets/images/logo.png';
        const img = new Image();
        img.src = logoUrl;
        doc.addImage(img, 'PNG', 10, 10, 50, 30);
      } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
      }
      
      // Título
      doc.setFontSize(22);
      doc.setTextColor(44, 62, 80);
      doc.text('COMPROBANTE DE VENTA', pageWidth/2, 30, { align: 'center' });
      
      // Información de la venta
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Venta N°: ${sale.saleId}`, 15, 50);
      doc.text(`Fecha: ${new Date(sale.saleDate).toLocaleDateString()}`, 15, 60);
      
      // Obtener el nombre del cliente usando el ID correcto
      const customerName = this.customers[sale.customer?.id || sale.customer?.id];
      doc.text(`Cliente: ${customerName}`, 15, 70);
      
      // Tabla de productos
      const headers = [['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']];
      const data = details.map((detail: any) => [
        detail.product?.comercialName || 'N/A',
        detail.quantity,
        `S/. ${detail.salePrice.toFixed(2)}`,
        `S/. ${detail.amountDetail.toFixed(2)}`
      ]);
      
      autoTable(doc, {
        head: headers,
        body: data,
        startY: 80,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255]
        }
      });
      
      // Total
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text(`Total: S/. ${sale.total.toFixed(2)}`, pageWidth - 20, finalY + 10, { align: 'right' });
      
      // Pie de página
      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text('¡Gracias por su compra!', pageWidth/2, finalY + 30, { align: 'center' });
      
      // Guardar el PDF
      doc.save(`Venta-${sale.saleId}.pdf`);
      
      this.snackBar.open('PDF generado exitosamente', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error('Error generando PDF:', error);
      this.snackBar.open('Error al generar el PDF', 'Cerrar', { duration: 3000 });
    }
}

}
