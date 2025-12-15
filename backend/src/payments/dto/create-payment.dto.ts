export class CreatePaymentDto {
  amount: number;
  currency?: string = 'GTQ';
  paymentMethod?: string;
  transactionReference?: string;
}
