export interface Supplier {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    ruc?: string;
    status?: string;
  }
  
  export interface Category {
    id: number;
    categoryName: string;
  }
  
  export interface Crop {
    id: number;
    name: string;
    createAt?: string;
  }
  
  export interface Product {
    id: number;
    comercialName: string;
    formulation: string;
    brand: string;
    salePrice: number;
    unit: string;
    status: string;
    concentration: string;
    concentrationUnit: string;
    stock: number;
    barCode: string;
    supplier?: Supplier;
    category?: Category;
    crop?: Crop;
  }
  