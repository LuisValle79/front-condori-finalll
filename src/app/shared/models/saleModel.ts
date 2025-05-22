import { ClienteModel } from "./clienteModel";

export interface Sale {
    saleId?: number;
    saleDate: string;
    total: number;
    customerId: number;
}

export interface Sale2 {
    saleId?: number;
    saleDate: string;
    total: number;
    customer: ClienteModel;
}