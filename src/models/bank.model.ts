export interface IBank {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  created_at: Date;
  updated_at: Date;
}

export interface IBankDTO {
  bank_name: string;
  account_name: string;
  account_number: string;
}
