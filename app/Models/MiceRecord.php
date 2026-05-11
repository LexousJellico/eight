<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MiceRecord extends Model
{
    protected $fillable = [
        'booking_id',
        'record_no',
        'year_recorded',
        'enterprise_group',
        'btc_group_code',

        'establishment_name',
        'event_name',
        'event_category',
        'type_of_event',
        'venue_area',
        'event_date_from',
        'event_date_to',

        'organization_name',
        'organizer_name',
        'organizer_type',
        'contact_person',
        'contact_number',
        'email',
        'address',

        'local_male_participants',
        'local_female_participants',
        'domestic_male_participants',
        'domestic_female_participants',
        'foreign_male_participants',
        'foreign_female_participants',

        'main_origin_country',
        'main_origin_province',
        'main_origin_city',

        'same_day_visitors',
        'overnight_visitors',
        'estimated_room_nights',
        'estimated_tourism_receipts',

        'total_employees',
        'female_employees',
        'male_employees',

        'permit_to_engage',
        'dot_accredited',
        'active_member',

        'remarks',
        'event_days',
        'total_participants',
        'status',
        'submitted_at',
        'submitted_by_user_id',
        'updated_by_user_id',
    ];

    protected $casts = [
        'booking_id' => 'integer',
        'submitted_by_user_id' => 'integer',
        'updated_by_user_id' => 'integer',

        'record_no' => 'integer',
        'year_recorded' => 'integer',
        'event_days' => 'integer',

        'local_male_participants' => 'integer',
        'local_female_participants' => 'integer',
        'domestic_male_participants' => 'integer',
        'domestic_female_participants' => 'integer',
        'foreign_male_participants' => 'integer',
        'foreign_female_participants' => 'integer',
        'total_participants' => 'integer',

        'same_day_visitors' => 'integer',
        'overnight_visitors' => 'integer',
        'estimated_room_nights' => 'integer',
        'estimated_tourism_receipts' => 'decimal:2',

        'total_employees' => 'integer',
        'female_employees' => 'integer',
        'male_employees' => 'integer',

        'permit_to_engage' => 'boolean',
        'dot_accredited' => 'boolean',
        'active_member' => 'boolean',

        'event_date_from' => 'date',
        'event_date_to' => 'date',
        'submitted_at' => 'datetime',
    ];

    protected static function booted(): void
{
    static::creating(function (MiceRecord $record): void {
        if (blank($record->establishment_name)) {
            $record->establishment_name = $record->organization_name
                ?: $record->organizer_name
                ?: $record->event_name
                ?: 'Baguio Convention and Cultural Center';
        }

        if (blank($record->year_recorded) && filled($record->event_date_from)) {
            $record->year_recorded = (int) \Illuminate\Support\Carbon::parse($record->event_date_from)->format('Y');
        }

        if (blank($record->status)) {
            $record->status = 'submitted';
        }
    });

    static::updating(function (MiceRecord $record): void {
        if (blank($record->establishment_name)) {
            $record->establishment_name = $record->organization_name
                ?: $record->organizer_name
                ?: $record->event_name
                ?: 'Baguio Convention and Cultural Center';
        }
    });
}
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by_user_id');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }

    public function getNormalizedEnterpriseGroupAttribute(): string
    {
        $value = strtoupper(trim((string) ($this->enterprise_group ?? '')));

        return in_array($value, ['PTE', 'STE'], true) ? $value : 'UNCLASSIFIED';
    }

    public function getNormalizedGroupCodeAttribute(): string
    {
        $value = strtoupper(trim((string) ($this->btc_group_code ?? '')));

        return $value !== '' ? $value : 'UNASSIGNED';
    }

    public function getIsSubmittedAttribute(): bool
    {
        return $this->submitted_at !== null && $this->status === 'submitted';
    }
}
