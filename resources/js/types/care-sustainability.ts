export interface CareSustainabilityData {
    id: number;
    verified_funds: number;
    daily_cost: number;
    resource_category: string;
    sustainability_endpoint: string | null;
    formatted_endpoint: string;
    seconds_remaining: number;
    est_days: number;
    urgency_status: 'STABLE' | 'NEEDS SUPPORT' | 'URGENT' | 'CRITICAL' | 'DEPLETED';
    urgency_label: string;
    calculation_notes: string;
    updated_by_name: string;
    last_updated_at: string;
    last_updated_formatted: string;
    thresholds: {
        stable: number;
        needs_support: number;
        urgent: number;
        critical: number;
    };
}

export interface CareSustainabilityHistoryItem {
    id: number;
    action: string;
    funds_amount: number | null;
    daily_cost: number;
    amount_added: number;
    days_added: number;
    endpoint_before: string;
    endpoint_after: string;
    notes: string | null;
    performed_by: string;
    donation_ref: string | null;
    created_at: string;
    time_ago: string;
}
