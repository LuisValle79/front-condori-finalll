import { Supplier } from "./supplierModel";

export interface Buy {
  buysId: number;
  price: number;
  suname: string;
  date: Date;
  invoiceNumber: string;
}


export interface buyEdit{
  buysId: number,
  buysPrice: number,
  supplier: Supplier,
  buysDate: string | Date;
  invoiceNumber: String
}

