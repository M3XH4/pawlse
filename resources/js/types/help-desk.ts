export interface FrequentProblem {
    id: number;
    title: string;
    category: string;
    problem_description: string | null;
    solution: string;
    target_audience: 'all' | 'user' | 'volunteer' | 'admin';
    is_published: boolean;
    display_order: number;
    helpful_count: number;
    created_by_user_id?: number | null;
    created_at: string;
    updated_at: string;
}

export interface HelpDeskReply {
    id: number;
    ticket_id: number;
    user_id: number;
    message: string;
    is_internal_note: boolean;
    created_at: string;
    user?: {
        id: number;
        name: string;
        role?: string;
        avatar_path?: string | null;
    } | null;
}

export interface HelpDeskTicket {
    id: number;
    ticket_number: string;
    user_id: number;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'waiting_on_user' | 'resolved' | 'closed';
    subject: string;
    description: string;
    target_role: 'admin' | 'super-admin';
    is_escalated: boolean;
    escalated_to_super_admin_at: string | null;
    escalation_reason: string | null;
    assigned_to_user_id: number | null;
    resolved_at: string | null;
    resolved_by_user_id: number | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email?: string;
        role?: string;
        avatar_path?: string | null;
    };
    assigned_to?: { id: number; name: string } | null;
    resolved_by?: { id: number; name: string } | null;
    replies?: HelpDeskReply[];
}
