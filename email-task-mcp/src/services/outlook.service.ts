import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

export interface OutlookEmail {
  id: string;
  subject: string;
  from: string;
  body: string;
  receivedAt: Date;
}

export class OutlookService {
  private client: Client;

  constructor(accessToken: string) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
  }

  async fetchEmails(maxResults: number = 10): Promise<OutlookEmail[]> {
    try {
      const response = await this.client
        .api('/me/mailFolders/inbox/messages')
        .top(maxResults)
        .select('id,subject,from,body,receivedDateTime')
        .orderby('receivedDateTime DESC')
        .get();

      const messages = response.value || [];
      const emails: OutlookEmail[] = messages.map((message: any) => ({
        id: message.id,
        subject: message.subject || 'No Subject',
        from: message.from?.emailAddress?.address || 'Unknown',
        body: message.body?.content || 'No body content',
        receivedAt: new Date(message.receivedDateTime)
      }));

      return emails;
    } catch (error) {
      console.error('Error fetching emails from Outlook:', error);
      throw new Error('Failed to fetch emails from Outlook');
    }
  }

  async getEmailById(emailId: string): Promise<OutlookEmail | null> {
    try {
      const message = await this.client
        .api(`/me/messages/${emailId}`)
        .select('id,subject,from,body,receivedDateTime')
        .get();

      return {
        id: message.id,
        subject: message.subject || 'No Subject',
        from: message.from?.emailAddress?.address || 'Unknown',
        body: message.body?.content || 'No body content',
        receivedAt: new Date(message.receivedDateTime)
      };
    } catch (error) {
      console.error('Error fetching email:', error);
      return null;
    }
  }

  async sendEmail(recipientTo: string, subject: string, body: string): Promise<boolean> {
    try {
      const message = {
        message: {
          subject: subject,
          body: {
            contentType: 'Text',
            content: body
          },
          toRecipients: [
            {
              emailAddress: {
                address: recipientTo
              }
            }
          ]
        }
      };

      await this.client
        .api('/me/sendMail')
        .post(message);

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  static async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
          scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Calendars.Read https://graph.microsoft.com/Chat.Read https://graph.microsoft.com/ChannelMessage.Read.All https://graph.microsoft.com/Files.Read.All offline_access'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      return (data as any).access_token || null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }
}

