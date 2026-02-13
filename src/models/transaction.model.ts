export interface ITransaction {
  id: string;
  status: "pending" | "paid" | "rejected";
  payment_proof: string | null;
  total_payment: number;
  customer_name: string;
  customer_contact: string;
  customer_address: string;
  created_at: Date;
  updated_at: Date;
}

export interface ITransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  qty: number;
  price_at_purchase: number;
}

// Response JOIN: transaction + items (with product details)
export interface ITransactionItemWithProduct extends ITransactionItem {
  product: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    stock: number;
    price: number;
    category_id: string;
  };
}

export interface ITransactionWithItems extends ITransaction {
  items: ITransactionItemWithProduct[];
}

// Input dari client
export interface ITransactionItemInput {
  product_id: string;
  qty: number;
}

export interface ITransactionInput {
  payment_proof?: string;
  total_payment: number;
  customer_name: string;
  customer_contact: string;
  customer_address: string;
  items: ITransactionItemInput[];
}