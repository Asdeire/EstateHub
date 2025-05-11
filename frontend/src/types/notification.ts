export type NotificationStatus = 'SENT' | 'DELIVERED' | 'FAILED'; 

export type Notification ={
    id: string;
    user_id: string;
    subscription_id: string;
    message: string;
    status: NotificationStatus;
    created_at: string;
    sent_at?: string | null;
}
