<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Services\BookingPrintablePayloadService;
use App\Support\BcccPrintableDocumentCatalog;
use App\Support\WorkspaceAccess;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingPrintableController extends Controller
{
    public function __construct(private readonly BookingPrintablePayloadService $printables)
    {
    }

    public function reservation(Request $request, Booking $booking): Response
    {
        return $this->render($request, $booking, BcccPrintableDocumentCatalog::RESERVATION_SUMMARY);
    }

    public function finalBill(Request $request, Booking $booking): Response
    {
        return $this->render($request, $booking, BcccPrintableDocumentCatalog::FINAL_BILL);
    }

    public function cancellation(Request $request, Booking $booking): Response
    {
        return $this->render($request, $booking, BcccPrintableDocumentCatalog::CANCELLATION_ASSESSMENT);
    }

    public function miceSummary(Request $request, Booking $booking): Response
    {
        return $this->render($request, $booking, BcccPrintableDocumentCatalog::MICE_SUMMARY);
    }

    private function render(Request $request, Booking $booking, string $documentType): Response
    {
        abort_unless(WorkspaceAccess::canViewBooking($request, $booking), 403);

        $role = WorkspaceAccess::role($request);
        $page = match ($role) {
            'admin' => 'admin/bookings/print',
            'manager' => 'manager/bookings/print',
            'staff' => 'staff/bookings/print',
            default => 'user/bookings/print',
        };

        $payload = $this->printables->build($booking, $documentType, $request);

        return Inertia::render($page, [
            'workspaceRole' => $role,
            'documentType' => $documentType,
            'documentTitle' => $payload['document']['title'] ?? 'Booking Document',
            'generatedAt' => now()->toIso8601String(),
            'printable' => $payload,
        ]);
    }
}
