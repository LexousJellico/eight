import { useForm } from '@inertiajs/react';
import ConfirmActionDialog from '@/components/confirm-action-dialog';
import type { Booking } from '@/types';

interface DeleteBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export default function DeleteBookingDialog({
  open,
  onOpenChange,
  booking,
}: DeleteBookingDialogProps) {
  const { delete: destroy, processing } = useForm();

  const confirmDelete = () => {
    if (!booking?.id) return;

    destroy(`/bookings/${booking.id}`, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <ConfirmActionDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete booking?"
      description={
        booking
          ? `This will permanently delete the booking record for “${booking.client_name}”. This action cannot be undone.`
          : 'This action cannot be undone.'
      }
      confirmLabel="Delete booking"
      cancelLabel="Cancel"
      onConfirm={confirmDelete}
      processing={processing}
      variant="destructive"
    />
  );
}
