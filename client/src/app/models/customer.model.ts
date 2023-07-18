export interface CustomerList {
    data: CustomerListDetails[];
}

export interface CustomerListDetails {
    customer_email: string;
    customer_id: number;
    customer_name: string;
    total_clocks: string;
    total_facilities: string;
    cu_code: string;
    cu_note: string;
    cu_api_key: string;
}
