import Mailjet from 'node-mailjet';
import { config } from '../utils/config';

const mailjet = Mailjet.apiConnect(
    config.emailService.mailjetApiKey,
    config.emailService.mailjetSecretKey
);

export class EmailService {
    async sendNotificationEmail(to: string, subject: string, html: string): Promise<void> {
        try {
            const response = await mailjet
                .post('send', { version: 'v3.1' })
                .request({
                    Messages: [
                        {
                            From: {
                                Email: config.emailService.senderEmail,
                                Name: 'EstateHub',
                            },
                            To: [
                                {
                                    Email: to,
                                    Name: to.split('@')[0],
                                },
                            ],
                            Subject: subject,
                            HTMLPart: html,
                        },
                    ],
                });

            console.log('Notification email sent successfully:', response.body);
        } catch (err) {
            console.error('Error sending notification email:', err);
            throw err;
        }
    }
}
