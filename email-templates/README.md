# Diamond Plus Email Templates

## 📧 What's Included

### 1. **Email Templates** (`SUPABASE_EMAIL_TEMPLATES.md`)
All 6 Supabase authentication email templates:
- ✅ Confirm Signup
- ✅ Invite User  
- ✅ Magic Link
- ✅ Change Email Address
- ✅ Reset Password
- ✅ Reauthentication

### 2. **Setup Guide** (`SUPABASE_EMAIL_SETUP_GUIDE.md`)
Step-by-step instructions for:
- Uploading logo
- Configuring Supabase
- Setting up custom SMTP
- Testing emails

### 3. **Preview Tool** (`preview-templates.html`)
- Local preview of all templates
- Side-by-side light/dark mode view
- Quick testing before deployment

### 4. **Logo Preparation** (`scripts/prepare-email-logo.sh`)
Script to convert your SVG logo to email-friendly formats

## 🎨 Design Features

### Gmail Dark Mode Compatibility
- Uses `color-scheme` meta tags
- CSS media queries for dark mode
- Tested color combinations
- No inverted colors issue

### Brand Colors
- **Primary Blue**: #0f293d (from your logo)
- **Accent Cyan**: #00dbff (from your logo)
- **Clean, professional design**

### Best Practices
- Table-based layout (email standard)
- Inline CSS for compatibility
- System fonts for consistency
- Mobile responsive
- Accessible markup

## 🚀 Quick Start

1. **Prepare Logo**:
   ```bash
   cd /root/diamond-plus/core
   ./scripts/prepare-email-logo.sh
   ```

2. **Upload Logo**:
   - Upload generated PNGs to your server
   - Update template URLs to point to hosted logo

3. **Configure Supabase**:
   - Go to Authentication → Email Templates
   - Copy each template HTML
   - Paste into corresponding Supabase template
   - Save

4. **Test**:
   - Send test emails
   - Check Gmail light/dark mode
   - Verify mobile rendering

## 📝 Template Variables

Supabase will replace these automatically:
- `{{ .ConfirmationURL }}` - Action link
- `{{ .Email }}` - User's email
- `{{ .NewEmail }}` - New email (for changes)

## 🔧 Customization

To modify templates:
1. Edit HTML in `SUPABASE_EMAIL_TEMPLATES.md`
2. Test with `preview-templates.html`
3. Update in Supabase dashboard

## 📱 Testing Checklist

- [ ] Logo displays correctly
- [ ] Links work properly
- [ ] Gmail dark mode looks good
- [ ] Mobile rendering is responsive
- [ ] Text is readable in all modes
- [ ] Buttons are clickable
- [ ] Footer information is correct

## 🆘 Support

If emails aren't working:
1. Check spam folder
2. Verify SMTP settings
3. Test with [Mail Tester](https://www.mail-tester.com)
4. Check Supabase logs

---

**Remember**: Always test email templates before going live!
