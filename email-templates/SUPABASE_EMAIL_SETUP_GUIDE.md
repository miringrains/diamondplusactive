# Supabase Email Template Setup Guide

## Quick Setup Steps

### 1. Upload Logo
First, create a web-accessible version of your logo:

```bash
# Convert SVG to PNG (if needed)
# Install imagemagick: apt-get install imagemagick
convert -density 300 -background transparent public/Diamondpluslogodark.svg -resize 400x100 public/email-logo.png

# Or use an online converter and upload the PNG
```

Upload to your server:
- Location: `https://diamondplusportal.com/email-logo.png`
- Size: 400x100px (2x for retina)
- Format: PNG with transparent background

### 2. Configure Supabase Email Templates

1. **Go to Supabase Dashboard**
   - Navigate to: Authentication → Email Templates

2. **Enable Custom SMTP (Recommended)**
   - For better deliverability, configure custom SMTP
   - Options: SendGrid, AWS SES, Mailgun, etc.
   - This prevents emails going to spam

3. **Update Each Template**:

   | Template Type | File to Use |
   |--------------|-------------|
   | Confirm signup | Use Template #1 |
   | Invite user | Use Template #2 |
   | Magic Link | Use Template #3 |
   | Change Email Address | Use Template #4 |
   | Reset Password | Use Template #5 |
   | Reauthentication | Use Template #6 |

4. **For Each Template**:
   - Copy the entire HTML from the templates
   - Paste into Supabase template editor
   - Update logo URL to your hosted version
   - Save

### 3. Test Email Rendering

#### Gmail Dark Mode Test:
1. Send test email to Gmail account
2. Enable dark mode in Gmail settings
3. Verify colors adapt properly

#### Email Client Testing Tools:
- [Litmus](https://litmus.com) - Paid, comprehensive
- [Email on Acid](https://www.emailonacid.com) - Paid, detailed
- [Mail Tester](https://www.mail-tester.com) - Free spam check

### 4. Custom SMTP Setup (Recommended)

#### Using SendGrid:
```javascript
// In Supabase Dashboard → Settings → Auth
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: [Your SendGrid API Key]
Sender Email: noreply@diamondplusportal.com
Sender Name: Diamond Plus
```

#### Using AWS SES:
```javascript
SMTP Host: email-smtp.[region].amazonaws.com
SMTP Port: 587
SMTP User: [Your AWS SMTP Username]
SMTP Pass: [Your AWS SMTP Password]
Sender Email: noreply@diamondplusportal.com
Sender Name: Diamond Plus
```

### 5. Email Best Practices Checklist

✅ **Pre-launch**:
- [ ] Logo uploaded and accessible
- [ ] All templates configured in Supabase
- [ ] Custom SMTP configured
- [ ] SPF/DKIM records set up
- [ ] Sender email verified

✅ **Testing**:
- [ ] Test all 6 email types
- [ ] Check Gmail light/dark mode
- [ ] Check Outlook rendering
- [ ] Check mobile rendering
- [ ] Verify all links work
- [ ] Check spam score

✅ **Post-launch**:
- [ ] Monitor email delivery rates
- [ ] Check spam folder rates
- [ ] Update templates based on feedback

## Troubleshooting

### Emails Going to Spam?
1. Set up SPF records: `v=spf1 include:_spf.supabase.com ~all`
2. Configure DKIM in your DNS
3. Use custom SMTP service
4. Ensure sender domain matches your site

### Dark Mode Issues?
1. Use the provided templates - they're tested
2. Avoid background images
3. Use transparent PNGs for logos
4. Test with real devices, not just dev tools

### Links Not Working?
1. Check Supabase URL configuration
2. Ensure `{{ .ConfirmationURL }}` is preserved
3. Verify redirect URLs in Supabase settings

## Color Reference

For consistency across all emails:

```css
/* Light Mode */
--primary: #0f293d;      /* Dark blue from logo */
--accent: #00dbff;       /* Cyan from logo */
--background: #f5f5f5;   /* Light gray */
--card: #ffffff;         /* White */
--text-primary: #1a1a1a; /* Almost black */
--text-secondary: #666666; /* Gray */
--border: #e5e5e5;       /* Light border */

/* Dark Mode */
--background-dark: #1a1a1a;
--card-dark: #2a2a2a;
--text-primary-dark: #ffffff;
--text-secondary-dark: #cccccc;
```

## Support

If you need help:
1. Check Supabase docs: https://supabase.com/docs/guides/auth/auth-email-templates
2. Test with Mail Tester: https://www.mail-tester.com
3. Use browser dev tools to inspect email HTML
