import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { google } from 'googleapis';
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  
  const { searchParams } = new URL(req.url);
  const label = searchParams.get('label') || 'INBOX';

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.messages.list({
      userId: 'me',
      labelIds: [label], 
      maxResults: 15,
    });

    const messages = response.data.messages || [];

 
    const emailPromises = messages.map(async (msg) => {
      try {
        const msgDetail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
        });

        const headers = msgDetail.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
        const date = headers.find(h => h.name === 'Date')?.value || '';

        return {
          id: msg.id,
          snippet: msgDetail.data.snippet,
          subject,
          from,
          date,
        };
      } catch (e) {
        return null; 
      }
    });

    const emails = (await Promise.all(emailPromises)).filter(Boolean); 

    return NextResponse.json({ emails });

  } catch (error) {
    console.error('Gmail API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}