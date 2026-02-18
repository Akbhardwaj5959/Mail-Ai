import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY, 
});

export async function POST(req) {
  try {
    const { messages, context } = await req.json();

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages,
      system: `You are Jarvis, an advanced Email Assistant.
      
      RULES:
      1. If the user wants to REVIEW or DRAFT an email, use 'draftEmail'.
      2. If the user wants to SEND an email directly, use 'sendDirectEmail'.
      3. If the user wants to SEARCH, use 'filterEmails'.
      4. If the user wants to SWITCH TABS, use 'changeView'.
      5. SPECIAL RULE (Reply Logic): When writing a reply, use the original sender's email for 'to' and prefix the subject with 'Re:'.
      6. Always prioritize using tools to fill data in the UI.
      
      Active Tab: ${context?.activeTab || 'Inbox'}`,
      
      tools: {
        draftEmail: tool({
          description: 'Open compose window with data (also used for Auto-Write reply)',
          parameters: z.object({ 
            to: z.string().describe('Recipient email address'), 
            subject: z.string().describe('Email subject line'), 
            body: z.string().describe('The content of the email') 
          }),
        }),
        sendDirectEmail: tool({
          description: 'Send email directly',
          parameters: z.object({ to: z.string(), subject: z.string(), body: z.string() }),
        }),
        filterEmails: tool({
          description: 'Search or filter emails in the current list',
          parameters: z.object({ query: z.string().describe('The name or keyword to search for') }),
        }),
        changeView: tool({
          description: 'Change the active tab/view',
          parameters: z.object({ 
            view: z.enum(['INBOX', 'SENT', 'DRAFTS', 'TRASH']).describe('The tab to switch to') 
          }),
        }),
      },
    });

    
    return result.toAIStreamResponse();

  } catch (error) {
    console.error("🔥 AI Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}