

export interface productCreated{
  
     id? : number,
     comercialName: string,
     formulation: string,
     brand: string,
     salePrice: number,
     unit: string,
     status: string,
     concentration: number,
     concentrationUnit: String,
     stock: number,
     barCode: string, // Asegúrate de que el nombre coincida con el template
     supplierId: number ,
     categoryId: number,
     cropId?: number,

}
export class productEdited{
  
  constructor(
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
    public supplierId: number ,
    public categoryId: number,
    public cropId?: number,
   
  ) {}
}
