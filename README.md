# LEDGR - Logging Expense Data from Generated Receipts
Receipts In, Insights Out. Automatically.

**LEDGR is an intelligent personal finance tool that automates expense tracking by parsing order confirmation emails. Simply forward your digital receipts, and LEDGR uses AI to extract, categorize, and visualize your spending.**


**Live Demo:** https://ledgr-neon.vercel.app/


## The Problem
Tracking personal expenses from countless online order confirmations is tedious, time-consuming, and often neglected. Digital receipts get buried in inboxes, manual data entry is error-prone, and gaining a clear overview of spending habits becomes a significant challenge.

## Our Solution: LEDGR
LEDGR offers a "zero-effort" solution by leveraging email forwarding and AI:
1.  **Forward Emails:** Users forward any order confirmation email to their unique LEDGR address.
2.  **AI Parsing:** LEDGR uses the Google Gemini 1.5 Flash model with structured output to automatically extract key information (vendor, date, items, prices, total).
3.  **Smart Categorization:** The AI also intelligently assigns a relevant category to each purchased item.
4.  **Visualize:** Data is securely stored and presented on a user-friendly dashboard with insightful analytics and budget tracking.

## Features
*   **Unique Email Ingestion:** Personalized forwarding address for each user.
*   **Universal Email Parsing:** AI-powered extraction from diverse order confirmation formats.
*   **Automatic Item Categorization:** Intelligent grouping of expenses.
*   **Secure & Private:** User-level data isolation via Supabase.
*   **Intuitive Dashboard:**
    *   **Orders View:** List of all orders with expandable line item details.
    *   **Categories View:** Purchases grouped by AI-inferred category.
    *   **Analytics:** Spending trends, category breakdowns, top vendor spending.
    *   **Budget Management:** Set overall and category-specific monthly budgets and track progress.
*   User Authentication via Supabase Auth.

## Screenshots

Your personalized dashboard offers an at-a-glance overview of your financial health: see total spending, stay on top of budget progress, track order processing, and review recent purchases, all in one place for quick decision-making.
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ubm6jfkdtxn4ad01c8fm.png)

The Orders tab neatly lists every purchase automatically logged from your forwarded emails, providing a complete and easily searchable history of your online spending.
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5cydllx9uri213ub4tei.png)

Dive deeper into any purchase with a detailed order view. See every item, its price, and its AI-assigned category, giving you granular control and understanding of where your money went.
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/gdfdg77x7du4d1qoj5is.png)

Instantly filter your purchases by category to understand spending in specific areas like 'Groceries' or 'Subscriptions,' helping you pinpoint where to optimize your budget.
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wsh0pbiukifd2uvrf3av.png)

Go beyond raw numbers. Our Analytics visually map your spending trends and category breakdowns, transforming data into actionable insights so you can identify habits and find opportunities to save.
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dz382lajvu8wb2tpi6ee.png)

Take control with flexible budgeting. Easily set (and update) overall monthly or category-specific budgets, and instantly see how you're tracking with clear visual progress, empowering smarter financial decisions before you overspend.
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wp7q60ijr7fjaf96ll5g.png)

Personalize your experience by selecting your preferred currency for expense tracking. Your profile also conveniently displays your unique LEDGR forwarding email address, ready for you to start automating!
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zpz7vxtcspjmt1o8o6j8.png)


## Tech Stack
*   **Frontend:** React (with Vite)
*   **Backend:** Supabase
    *   **Database:** PostgreSQL
    *   **Authentication:** Supabase Auth
    *   **Edge Functions (Deno/TypeScript):**
        *   For handling inbound email webhooks from Postmark.
        *   For processing emails, interacting with Gemini API, and storing data.
    *   **Database Webhooks/Triggers:** To initiate email processing.
*   **AI:** Google Gemini 2.5 Flash (via Gemini API for structured output)
*   **Email Ingestion Service:** Postmark (Inbound Stream)
*   **Deployment:**
    *   Frontend: Vercel
    *   Supabase: Handles its own infrastructure.

## Technical Flow Overview
1.  **Sign-up & Setup:** User registers (Supabase Auth), gets a unique LEDGR forwarding email.
2.  **Email Forward:** User forwards an order email.
3.  **Postmark Ingest:** Postmark receives it, webhooks JSON payload to Supabase Edge Function 1 (EF1).
4.  **Initial Storage:** EF1 extracts user ID, saves raw email to `forwarded_emails` table (Supabase DB).
5.  **Processing Trigger:** New `forwarded_emails` entry triggers DB webhook, invoking Supabase Edge Function 2 (EF2).
6.  **Gemini Parsing:** EF2 sends email content to Gemini API, requesting structured output.
7.  **Data Storage:** EF2 saves parsed order details to `orders` and `line_items` tables.
8.  **Status Update:** EF2 updates email status in `forwarded_emails`.
9.  **Frontend Display:** Authenticated user's React app fetches data from Supabase DB (with RLS) for dashboard.

*(Refer to the diagram below for a visual representation)*
![LEDR diagram](https://github.com/user-attachments/assets/18e55cbc-de2a-4313-97d9-2cbce51107e0)



## Future Improvements
*   CSV data export.
*   User-customizable categories and category rules.
*   Weekly budget options or custom budget periods.
*   Support for parsing other types of financial documents (e.g., PDF bank statements).
*   More advanced analytics and predictive insights.
*   Mobile application.
