<?php

namespace App\Http\Requests;

use App\Support\BookingStatusCatalog;
use App\Support\DressingRoomCatalog;
use App\Support\MiceReportCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $payload = [];

        if ($this->has('booking_status')) {
            $payload['booking_status'] = BookingStatusCatalog::normalizeBookingStatus(
                (string) $this->input('booking_status'),
                'pencil_booked'
            );
        }

        if ($this->has('payment_status')) {
            $payload['payment_status'] = BookingStatusCatalog::normalizeBookingPaymentStatus(
                (string) $this->input('payment_status'),
                'unpaid'
            );
        }

        if ($this->has('dressing_room_selection')) {
            $payload['dressing_room_selection'] = DressingRoomCatalog::normalize((string) $this->input('dressing_room_selection'));
            $payload['dressing_room_charge'] = DressingRoomCatalog::charge($payload['dressing_room_selection']);
        }

        if ($this->has('private_event_type') || $this->has('type_of_event')) {
            $payload['mice_required'] = MiceReportCatalog::requiresMiceReport(
                (string) $this->input('type_of_event'),
                $this->input('private_event_type') ? (string) $this->input('private_event_type') : null,
            );
        }

        if ($payload !== []) {
            $this->merge($payload);
        }
    }

    public function rules(): array
    {
        return [
            'service_id' => ['required', 'exists:services,id'],
            'items' => ['nullable', 'array'],
            'items.*.service_id' => ['required_with:items', 'exists:services,id'],
            'items.*.quantity' => ['nullable', 'numeric', 'min:1'],
            'payment_meta' => ['nullable', 'array'],

            'selected_package_code' => ['nullable', 'string', 'max:80'],
            'package_code' => ['nullable', 'string', 'max:80'],
            'selected_area_keys' => ['nullable', 'array'],
            'area_keys' => ['nullable', 'array'],
            'selected_area_keys.*' => ['string', 'max:80'],
            'area_keys.*' => ['string', 'max:80'],
            'dressing_room_selection' => ['nullable', 'string', Rule::in(array_keys(DressingRoomCatalog::options()))],
            'dressing_room_charge' => ['nullable', 'numeric', 'min:0'],
            'mice_required' => ['nullable', 'boolean'],
            'mice_exemption_reason' => ['nullable', 'string', 'max:255'],
            'private_event_type' => ['nullable', 'string', 'max:120'],
            'schedule_version' => ['nullable', 'string', 'max:40'],
            'schedule_meta' => ['nullable', 'array'],
            'schedule_segments' => ['nullable', 'array'],
            'schedule_segments.*.date' => ['required_with:schedule_segments', 'date_format:Y-m-d'],
            'schedule_segments.*.segment_role' => ['nullable', 'string', 'max:40'],
            'schedule_segments.*.role' => ['nullable', 'string', 'max:40'],
            'schedule_segments.*.base_block' => ['required_with:schedule_segments', 'string', 'max:40'],
            'schedule_segments.*.additional_hours' => ['nullable', 'integer', 'min:0', 'max:5'],
            'schedule_segments.*.area_keys' => ['nullable', 'array'],
            'schedule_segments.*.area_keys.*' => ['string', 'max:80'],

            'organization_type' => ['nullable', 'string', 'max:100'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'client_name' => ['required', 'string', 'max:255'],
            'client_contact_number' => ['required', 'string', 'max:30'],
            'client_email' => ['required', 'email', 'max:255'],

            'client_address' => ['nullable', 'string', 'max:1000'],
            'client_region' => ['nullable', 'string', 'max:255'],
            'client_province' => ['nullable', 'string', 'max:255'],
            'client_city_municipality' => ['nullable', 'string', 'max:255'],
            'client_barangay' => ['nullable', 'string', 'max:255'],
            'client_zip_code' => ['nullable', 'string', 'max:30'],
            'client_street_address' => ['nullable', 'string', 'max:1000'],

            'head_of_organization' => ['nullable', 'string', 'max:255'],
            'type_of_event' => ['required', 'string', 'max:255'],

            'booking_date_from' => ['required', 'date'],
            'booking_date_to' => ['required', 'date', 'after:booking_date_from'],
            'number_of_guests' => ['required', 'integer', 'min:1'],

            'survey_email' => ['nullable', 'email', 'max:255'],
            'survey_proof_image' => ['nullable', 'image', 'max:5120'],

            'booking_status' => ['nullable', 'string', 'max:100'],
            'payment_status' => ['nullable', 'string', 'max:100'],
            'is_public_calendar_visible' => ['nullable', 'boolean'],
            'public_calendar_title' => ['nullable', 'string', 'max:255'],

            'estimated_usage' => ['nullable', 'string', 'max:100'],
            'estimated_duration_hours' => ['nullable', 'numeric', 'min:0'],
            'estimated_other_rentals' => ['nullable', 'string', 'max:1000'],
            'estimated_additional_charges' => ['nullable', 'numeric', 'min:0'],
            'reservation_notes' => ['nullable', 'string', 'max:3000'],

            'package_acknowledged' => ['nullable', 'boolean'],
            'policy_acknowledged' => ['nullable', 'boolean'],
            'accuracy_acknowledged' => ['nullable', 'boolean'],
        ];
    }
}
