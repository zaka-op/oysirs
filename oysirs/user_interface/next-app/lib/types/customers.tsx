import {BaseProps} from './base';


export interface CustomerNameProps extends BaseProps {
  name: string;
}

export interface CustomerEmailProps extends BaseProps {
  email: string;
}

export interface CustomerMobileNoProps extends BaseProps {
  mobile_no: string;
}

export interface CustomerAddressProps extends BaseProps {
  address: string;
}

export interface CustomerProps extends BaseProps {
  names: CustomerNameProps[];
  emails: CustomerEmailProps[];
  mobiles: CustomerMobileNoProps[];
  addresses: CustomerAddressProps[];
}

export interface CustomerListProps {
  customers: CustomerProps[];
  total: number;
  offset: number;
  limit: number;
}

export interface TrxnSummaryProps {
  bank: string;
  total_trxns: number;
  total_amount: number;
}

export interface CustomerWithTrxnSummaryProps {
  customer: CustomerProps;
  trxn_summary: TrxnSummaryProps[];
  // year: string;
  // bank: string;
}