import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'default_api_key');

export class EmailService {
    async sendNotificationEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            const response = await resend.emails.send({
                from: 'EstateHub <onboarding@resend.dev>',
                to,
                subject,
                html,
            });
            console.log('Notification email sent successfully:', response);
        } catch (err) {
            console.error('Error sending notification email:', err);
            throw err;
        }
    }
}
