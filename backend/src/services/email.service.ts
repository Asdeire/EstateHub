import { Resend } from 'resend';
import { config } from '../utils/config';  

const resend = new Resend(config.emailService.resendApiKey); 

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
