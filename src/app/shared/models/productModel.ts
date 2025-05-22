import { Supplier } from './supplierModel';
import { Category } from './categoryModel';
import { crop } from './cropsModel';

export class Product {
  [x: string]: any;
  constructor(
    public id : number,
    public comercialName: string,
    public formulation: string,
    public brand: string,
    public salePrice: number,
    public unit: string,
    public status: string,
    public concentration: number,
    public concentrationUnit: String,
    public stock: number,
    public barCode: string, // Asegúrate de que el nombre coincida con el template
    public supplier: Supplier ,
    public category: Category,
    public crop?: crop,
   
  ) {}
}


