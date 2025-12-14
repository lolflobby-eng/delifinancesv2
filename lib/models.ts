export type TransactionType = 'income' | 'expense';

export interface DeliveryLog {
    id: string; // UUID
    user_id: string;
    created_at?: string;
    type: TransactionType;
    amount: number;
    description?: string;
    date: string; // YYYY-MM-DD
    delivery_price?: number;
    commission_profit?: number;
    category?: string;
}

export interface BeverageProduct {
    id: number;
    name: string;
    buy_price: number;
    sell_price: number;
    current_stock: number;
}

export interface BeverageTransaction {
    id: number;
    product_id: number;
    type: 'sale' | 'purchase';
    quantity: number;
    total_amount: number;
    date: string;
    product?: BeverageProduct; // Joins
}

export interface ExpenseCategory {
    id: number;
    name: string;
    type: 'delivery' | 'investment';
}

export interface BeverageLog {
    id: number;
    created_at?: string;
    date: string;
    beverage_type: string;
    purchase_cost: number;
    storage_cost: number;
    sales_income: number;
}

export interface InvestmentRecord {
    id: number;
    date: string;
    amount: number;
    category?: string;
    notes?: string;
}

export interface BankRecord {
    id: number;
    date: string;
    balance: number;
    notes?: string;
}
