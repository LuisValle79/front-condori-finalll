import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

import { PrincipalComponent } from './feature/principal/principal.component';
import { ProductList } from './feature/products/products-list/product.component';
import { ClientesComponent } from './feature/cliente/customer-list/customer-list.component';
import { ProductFormComponent } from './feature/products/product-create/product.component';
import { CreateCustomerComponent } from './feature/cliente/create-customer/create-customer.component';
import { PurchaseListComponent } from './feature/compras-comprasDetalle/purchase-list/purchase-list.component';
import { PurchaseFormComponent } from './feature/compras-comprasDetalle/purchase-form/purchase-form.component';
import { SaleListComponent } from './feature/venta/sale-list/sale-list.component';
import { SaleFormComponent } from './feature/venta/sale-form/sale-form.component';

// Importa otros componentes de página

export const routes: Routes = [
    {
        path: '',
        component: AdminLayoutComponent, children: [
            {
                path: '',
                component: PrincipalComponent
            },
            {
                path: 'products',
                component: ProductList
            },
            {
                path: 'product-crear',
                component: ProductFormComponent
            },
            {
                path: 'product-editar/:id',
                component: ProductFormComponent
            },
            {
                path: 'clientes',
                component: ClientesComponent

            },
            {
                path: 'clientes-crear',
                component: CreateCustomerComponent
            },
            {
                path: 'clientes-editar/:id',
                component: CreateCustomerComponent
            },
            {
                path: 'compras',
                component: PurchaseListComponent
            },
            {
                path: 'compras-add',
                component: PurchaseFormComponent
            },
            {
                path: 'ventas',
                children: [
                  { path: '', component: SaleListComponent },
                  { path: 'nueva', component: SaleFormComponent }
                ]
              }
            
              ] // Componente que contiene el sidebar
          }
      ];