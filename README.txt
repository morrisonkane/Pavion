PavionBank Demo — Hosting Package

DEMO ONLY: This app simulates accounts and balances. It does not process real money and is not production banking software. Do not collect real financial or identity data.

Fresh database
- This package intentionally does not include data/db.json. On first startup, the server creates a new empty database.
- Keep persistent storage mounted at the app's data/ directory on your host, or data will be lost on redeploy/restart depending on the host.
- Back up data/db.json regularly.

Local run
1. Install Node.js 18 or newer.
2. Run: npm start
3. Open http://localhost:3000/ and admin page http://localhost:3000/admin.html
4. Local-only default admin login: admin@pavionbank.local / ChangeMe123!

Public deployment (required settings)
Set these environment variables in the hosting dashboard:
- NODE_ENV=production
- PAVION_ADMIN_EMAIL=your own admin email
- PAVION_ADMIN_PASSWORD=a unique strong password
The app uses the hosting platform's PORT environment variable. Do not use the local default credentials on a public deployment.

Deploy using the package root (the folder containing package.json and server.js). Build command may be left blank; start command: npm start. Attach persistent storage mounted at /app/data (or the equivalent application data/ folder path provided by your host).

Features
- Account applications begin pending and require admin approval.
- Only the admin can add simulated demo deposits.
- Admin can approve/reject applications and activate/deactivate accounts.
- Customer transfers are simulated and do not move real money.

Security note
This is a learning/demo project, not a security-audited financial system. Do not use it for real banking, real deposits, or sensitive personal information.

SUPPORT PAGES ADDED
- support.html (Help & Support)
- contact-support.html (demo contact form; does not send messages until a real support service is configured)
- faq.html
- about-us.html
- security.html
- privacy.html (template; review before public use)
- terms.html (template; review before public use)
- fees.html
- complaints.html
All pages are linked from the website navigation/footer and use support.css. The site is a simulated banking demo; balances and transfers are not real money.


SUPPORT TICKETS + EMAIL NOTIFICATIONS
- Contact Support submits to POST /api/support/tickets. Tickets are saved in data/db.json and visible in the admin dashboard Support inbox. Admin can resolve or reopen tickets.
- Email delivery requires SMTP credentials configured as environment variables in your hosting provider:
  SUPPORT_EMAIL=the inbox that should receive support tickets
  SMTP_HOST=your email provider SMTP host
  SMTP_PORT=587 (or provider-recommended port)
  SMTP_SECURE=false (set true for implicit TLS, usually port 465)
  SMTP_USER=SMTP login username
  SMTP_PASS=SMTP app password / SMTP password
  SMTP_FROM=verified sender address (optional; defaults to SMTP_USER)
- Install dependencies with npm install; nodemailer is listed in package.json. Never commit SMTP credentials to GitHub.
- If SMTP is not configured, tickets are still stored in the admin inbox and the form says email is not configured. Test email delivery before public launch.
