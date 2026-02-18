<!-- This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details. -->


🤖 Jarvis AI: Al-Powered Mail Web Application
Build a functional mail application where an AI assistant (Jarvis) controls the UI programmatically—composing emails, navigating views, and interacting with the interface on the user's behalf.

🚀 Live Demo & Screenshots

Live Link: [Tumhara Vercel URL yahan daalo] 


Video Demo: [Loom ya Drive video link] 

✨ Features
1. AI Assistant (The Core) 


Compose & Send: Fill forms visibly using natural language (e.g., "Draft a leave mail to boss").



Context Awareness: Understands the currently open email for smart replies (e.g., "Reply to this").


Navigation: Switches tabs like Inbox, Sent, and Trash via voice/text commands.



Smart Filtering: Filters emails by sender or keywords using AI (e.g., "Find emails from Sarah").


2. Functional Mail Client 


Real-time Sync: New emails appear in the inbox automatically without manual refresh (via Polling/Webhooks).


Gmail Integration: Fully connected with Google Gmail API for sending and receiving.



Polished UI: Modern dark mode interface built for productivity.

🛠️ Tech Stack 

Framework: Next.js (App Router)

AI Engine: Groq (Llama-3.3-70B) via Vercel AI SDK

Authentication: NextAuth.js (Google OAuth 2.0)

Styling: Tailwind CSS & Lucide React Icons

Backend: Node.js API Routes

🏗️ Architecture Decisions & Trade-offs 

Vercel AI SDK: Used for seamless streaming responses and "Tool Calling" (Function Calling) which allows Jarvis to interact with the React state directly.


Polling for Sync: Implemented a 30-second silent background sync to ensure the inbox stays updated without heavy Pub/Sub overhead.


Tool-Centric Design: Instead of a simple chatbot, Jarvis uses tools to "paint the UI" and fill forms, meeting the primary evaluation criteria.