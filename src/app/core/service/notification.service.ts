import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../shared/models/productModel';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private toastr = inject(ToastrService);

    showProductUpdate(product: Product): void {
        this.toastr.info(
            `Marca: ${product.brand}`,
            `Producto creado: ${product.comercialName}`,
            {
                timeOut: 5000,
                positionClass: 'toast-bottom-right',
                progressBar: true
            }
        );
    }

    showProductActivate(product: Product): void {
        if (product.status === 'I') {
            this.toastr.error(
                `Producto eliminado<br/><br/><strong>Producto:</strong> ${product.comercialName}`,
                '',
                {
                    enableHtml: true,
                    timeOut: 5000,
                    positionClass: 'toast-bottom-right',
                    progressBar: true,
                }
            );
        } else {
            this.toastr.success(
                `Producto activado<br/><br/><strong>Producto:</strong> ${product.comercialName}`,
                '',
                {
                    enableHtml: true,
                    timeOut: 5000,
                    positionClass: 'toast-bottom-right',
                    progressBar: true,
                }
            );
        }
    }

    showSuccess(message: string, title: string = 'Éxito'): void {
        this.toastr.success(message, title);
    }

    showError(message: string, title: string = 'Error'): void {
        this.toastr.error(message, title);
    }

    showWarning(message: string, title: string = 'Advertencia'): void {
        this.toastr.warning(message, title);
    }

    showInfo(message: string, title: string = 'Información'): void {
        this.toastr.info(message, title);
    }
}