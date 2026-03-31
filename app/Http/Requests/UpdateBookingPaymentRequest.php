<?php

namespace App\Http\Requests;

use App\Models\BookingPayment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingPaymentRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $amount = $this->input('amount');

        if (is_string($amount)) {
            $amount = str_replace([',', ' '], '', trim($amount));
        }

        $paymentMethod = trim((string) $this->input('payment_method', ''));
        $transactionReference = trim((string) $this->input('transaction_reference', ''));
        $paymentGateway = trim((string) $this->input('payment_gateway', ''));
        $remarks = trim((string) $this->input('remarks', ''));
        $status = trim((string) $this->input('status', ''));

        $this->merge([
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'transaction_reference' => $transactionReference !== '' ? $transactionReference : null,
            'payment_gateway' => $paymentGateway !== '' ? $paymentGateway : null,
            'remarks' => $remarks !== '' ? $remarks : null,
            'status' => $status !== '' ? strtolower($status) : null,
        ]);
    }

    public function authorize(): bool
    {
        $user = $this->user();

        return $user ? $user->can('payments.manage') : false;
    }

    public function rules(): array
    {
        /** @var BookingPayment|null $payment */
        $payment = $this->route('payment');

        return [
            'status' => ['required', 'in:pending,confirmed,failed,declined,refunded'],
            'payment_method' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'transaction_reference' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('booking_payments', 'transaction_reference')->ignore($payment?->id),
            ],
            'payment_gateway' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:255'],
        ];
    }
}
