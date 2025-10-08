# Supabase Email Templates for Diamond Plus

## Important Email Design Notes

### Gmail Dark Mode Compatibility:
1. **Use transparent backgrounds** where possible
2. **Specify both light and dark colors** using CSS media queries
3. **Avoid pure white (#FFFFFF)** - use #FAFAFA or #F5F5F5
4. **Test with forced colors** - some email clients invert colors
5. **Use system fonts** for better rendering

### Color Palette:
- **Primary Blue**: #0f293d (from logo)
- **Accent Cyan**: #00dbff (from logo)
- **Light Background**: #FAFAFA
- **Dark Text**: #1a1a1a
- **Gray Text**: #666666
- **Border**: #E5E5E5

### Logo Usage:
- Host logo on your server: `https://diamondplusportal.com/Diamondpluslogodark.svg`
- Use PNG fallback for better email client support
- Include alt text for accessibility

## How to Use These Templates in Supabase:

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Enable "Enable custom SMTP" if you want better deliverability
3. For each template type, paste the corresponding HTML below
4. Update the logo URL to your hosted version
5. Test each template before going live

---

## 1. Confirm Signup Email

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
        
        @media (prefers-color-scheme: dark) {
            .email-body {
                background-color: #1a1a1a !important;
            }
            .content-wrapper {
                background-color: #2a2a2a !important;
                color: #ffffff !important;
            }
            .text-primary {
                color: #ffffff !important;
            }
            .text-secondary {
                color: #cccccc !important;
            }
            .button-primary {
                background-color: #00dbff !important;
                color: #0f293d !important;
            }
            .logo-dark {
                display: block !important;
            }
            .logo-light {
                display: none !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #1a1a1a;">
    <div class="email-body" style="background-color: #f5f5f5; padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
            <tr>
                <td>
                    <div class="content-wrapper" style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Logo -->
                        <div style="text-align: center; margin-bottom: 40px;">
                            <img src="https://diamondplusportal.com/Diamondpluslogodark.svg" alt="Diamond Plus" width="200" style="max-width: 100%; height: auto;">
                        </div>
                        
                        <!-- Content -->
                        <h1 class="text-primary" style="color: #0f293d; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 20px 0;">Welcome to Diamond Plus!</h1>
                        
                        <p class="text-secondary" style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; text-align: center;">
                            Thanks for signing up! Please confirm your email address to get started with your real estate transformation journey.
                        </p>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{{ .ConfirmationURL }}" class="button-primary" style="display: inline-block; background-color: #00dbff; color: #0f293d; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Confirm Email Address
                            </a>
                        </div>
                        
                        <!-- Alternative Link -->
                        <p class="text-secondary" style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 0 0; text-align: center;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="{{ .ConfirmationURL }}" style="color: #00dbff; word-break: break-all;">{{ .ConfirmationURL }}</a>
                        </p>
                        
                        <!-- Footer -->
                        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center;">
                            <p class="text-secondary" style="color: #999999; font-size: 12px; margin: 0;">
                                This email was sent to {{ .Email }}<br>
                                © 2025 Diamond Plus. All rights reserved.
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
```

---

## 2. Invite User Email

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style>
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
        
        @media (prefers-color-scheme: dark) {
            .email-body { background-color: #1a1a1a !important; }
            .content-wrapper { background-color: #2a2a2a !important; color: #ffffff !important; }
            .text-primary { color: #ffffff !important; }
            .text-secondary { color: #cccccc !important; }
            .button-primary { background-color: #00dbff !important; color: #0f293d !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #1a1a1a;">
    <div class="email-body" style="background-color: #f5f5f5; padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
            <tr>
                <td>
                    <div class="content-wrapper" style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Logo -->
                        <div style="text-align: center; margin-bottom: 40px;">
                            <img src="https://diamondplusportal.com/Diamondpluslogodark.svg" alt="Diamond Plus" width="200" style="max-width: 100%; height: auto;">
                        </div>
                        
                        <!-- Content -->
                        <h1 class="text-primary" style="color: #0f293d; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 20px 0;">You're Invited to Diamond Plus!</h1>
                        
                        <p class="text-secondary" style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; text-align: center;">
                            You've been invited to join Diamond Plus, the premier business acceleration platform for real estate professionals.
                        </p>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{{ .ConfirmationURL }}" class="button-primary" style="display: inline-block; background-color: #00dbff; color: #0f293d; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Accept Invitation
                            </a>
                        </div>
                        
                        <!-- Features -->
                        <div style="background-color: #fafafa; padding: 30px; border-radius: 8px; margin: 30px 0;">
                            <h3 class="text-primary" style="color: #0f293d; font-size: 18px; margin: 0 0 20px 0;">What you'll get access to:</h3>
                            <ul style="color: #666666; font-size: 14px; line-height: 24px; margin: 0; padding-left: 20px;">
                                <li>8 comprehensive business modules</li>
                                <li>Exclusive podcasts and coaching content</li>
                                <li>Active community of top performers</li>
                                <li>Weekly challenges and workshops</li>
                                <li>AI-powered business tools</li>
                            </ul>
                        </div>
                        
                        <!-- Alternative Link -->
                        <p class="text-secondary" style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 0 0; text-align: center;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="{{ .ConfirmationURL }}" style="color: #00dbff; word-break: break-all;">{{ .ConfirmationURL }}</a>
                        </p>
                        
                        <!-- Footer -->
                        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center;">
                            <p class="text-secondary" style="color: #999999; font-size: 12px; margin: 0;">
                                This invitation will expire in 7 days<br>
                                © 2025 Diamond Plus. All rights reserved.
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
```

---

## 3. Magic Link Email

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style>
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
        
        @media (prefers-color-scheme: dark) {
            .email-body { background-color: #1a1a1a !important; }
            .content-wrapper { background-color: #2a2a2a !important; color: #ffffff !important; }
            .text-primary { color: #ffffff !important; }
            .text-secondary { color: #cccccc !important; }
            .button-primary { background-color: #00dbff !important; color: #0f293d !important; }
            .warning-box { background-color: #3a3a3a !important; border-color: #555555 !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #1a1a1a;">
    <div class="email-body" style="background-color: #f5f5f5; padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
            <tr>
                <td>
                    <div class="content-wrapper" style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Logo -->
                        <div style="text-align: center; margin-bottom: 40px;">
                            <img src="https://diamondplusportal.com/Diamondpluslogodark.svg" alt="Diamond Plus" width="200" style="max-width: 100%; height: auto;">
                        </div>
                        
                        <!-- Content -->
                        <h1 class="text-primary" style="color: #0f293d; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 20px 0;">Your Magic Link is Here!</h1>
                        
                        <p class="text-secondary" style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; text-align: center;">
                            Click the button below to instantly sign in to your Diamond Plus account.
                        </p>
                        
                        <!-- Security Notice -->
                        <div class="warning-box" style="background-color: #fff9e6; border: 1px solid #ffd666; border-radius: 8px; padding: 20px; margin: 20px 0;">
                            <p style="color: #8b6914; font-size: 14px; margin: 0; text-align: center;">
                                ⚡ This link expires in 10 minutes and can only be used once
                            </p>
                        </div>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{{ .ConfirmationURL }}" class="button-primary" style="display: inline-block; background-color: #00dbff; color: #0f293d; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Sign In to Diamond Plus
                            </a>
                        </div>
                        
                        <!-- Alternative Link -->
                        <p class="text-secondary" style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 0 0; text-align: center;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="{{ .ConfirmationURL }}" style="color: #00dbff; word-break: break-all;">{{ .ConfirmationURL }}</a>
                        </p>
                        
                        <!-- Security Footer -->
                        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5;">
                            <p class="text-secondary" style="color: #999999; font-size: 12px; margin: 0; text-align: center;">
                                If you didn't request this login link, please ignore this email.<br>
                                Your account remains secure.<br><br>
                                © 2025 Diamond Plus. All rights reserved.
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
```

---

## 4. Change Email Address

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style>
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
        
        @media (prefers-color-scheme: dark) {
            .email-body { background-color: #1a1a1a !important; }
            .content-wrapper { background-color: #2a2a2a !important; color: #ffffff !important; }
            .text-primary { color: #ffffff !important; }
            .text-secondary { color: #cccccc !important; }
            .button-primary { background-color: #00dbff !important; color: #0f293d !important; }
            .info-box { background-color: #3a3a3a !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #1a1a1a;">
    <div class="email-body" style="background-color: #f5f5f5; padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
            <tr>
                <td>
                    <div class="content-wrapper" style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Logo -->
                        <div style="text-align: center; margin-bottom: 40px;">
                            <img src="https://diamondplusportal.com/Diamondpluslogodark.svg" alt="Diamond Plus" width="200" style="max-width: 100%; height: auto;">
                        </div>
                        
                        <!-- Content -->
                        <h1 class="text-primary" style="color: #0f293d; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 20px 0;">Confirm Your Email Change</h1>
                        
                        <p class="text-secondary" style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; text-align: center;">
                            You've requested to change your email address for your Diamond Plus account.
                        </p>
                        
                        <!-- Email Change Info -->
                        <div class="info-box" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;"><strong>Current Email:</strong> {{ .Email }}</p>
                            <p style="color: #666666; font-size: 14px; margin: 0;"><strong>New Email:</strong> {{ .NewEmail }}</p>
                        </div>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{{ .ConfirmationURL }}" class="button-primary" style="display: inline-block; background-color: #00dbff; color: #0f293d; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Confirm Email Change
                            </a>
                        </div>
                        
                        <!-- Warning -->
                        <div style="background-color: #ffe6e6; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <p style="color: #cc0000; font-size: 14px; margin: 0; text-align: center;">
                                ⚠️ After confirming, you'll need to use your new email address to sign in
                            </p>
                        </div>
                        
                        <!-- Alternative Link -->
                        <p class="text-secondary" style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 0 0; text-align: center;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="{{ .ConfirmationURL }}" style="color: #00dbff; word-break: break-all;">{{ .ConfirmationURL }}</a>
                        </p>
                        
                        <!-- Footer -->
                        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center;">
                            <p class="text-secondary" style="color: #999999; font-size: 12px; margin: 0;">
                                If you didn't request this change, please contact support immediately.<br><br>
                                © 2025 Diamond Plus. All rights reserved.
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
```

---

## 5. Reset Password Email

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style>
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
        
        @media (prefers-color-scheme: dark) {
            .email-body { background-color: #1a1a1a !important; }
            .content-wrapper { background-color: #2a2a2a !important; color: #ffffff !important; }
            .text-primary { color: #ffffff !important; }
            .text-secondary { color: #cccccc !important; }
            .button-primary { background-color: #00dbff !important; color: #0f293d !important; }
            .security-tips { background-color: #3a3a3a !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #1a1a1a;">
    <div class="email-body" style="background-color: #f5f5f5; padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
            <tr>
                <td>
                    <div class="content-wrapper" style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Logo -->
                        <div style="text-align: center; margin-bottom: 40px;">
                            <img src="https://diamondplusportal.com/Diamondpluslogodark.svg" alt="Diamond Plus" width="200" style="max-width: 100%; height: auto;">
                        </div>
                        
                        <!-- Content -->
                        <h1 class="text-primary" style="color: #0f293d; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 20px 0;">Reset Your Password</h1>
                        
                        <p class="text-secondary" style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; text-align: center;">
                            We received a request to reset your Diamond Plus account password. Click the button below to create a new password.
                        </p>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{{ .ConfirmationURL }}" class="button-primary" style="display: inline-block; background-color: #00dbff; color: #0f293d; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Reset Password
                            </a>
                        </div>
                        
                        <!-- Expiry Notice -->
                        <p class="text-secondary" style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0; text-align: center;">
                            🕐 This link expires in 1 hour for security reasons
                        </p>
                        
                        <!-- Security Tips -->
                        <div class="security-tips" style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0;">
                            <h3 style="color: #0f293d; font-size: 16px; margin: 0 0 15px 0;">Password Security Tips:</h3>
                            <ul style="color: #666666; font-size: 14px; line-height: 22px; margin: 0; padding-left: 20px;">
                                <li>Use at least 8 characters</li>
                                <li>Include uppercase and lowercase letters</li>
                                <li>Add numbers and special characters</li>
                                <li>Don't reuse passwords from other sites</li>
                            </ul>
                        </div>
                        
                        <!-- Alternative Link -->
                        <p class="text-secondary" style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 0 0; text-align: center;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="{{ .ConfirmationURL }}" style="color: #00dbff; word-break: break-all;">{{ .ConfirmationURL }}</a>
                        </p>
                        
                        <!-- Footer -->
                        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center;">
                            <p class="text-secondary" style="color: #999999; font-size: 12px; margin: 0;">
                                If you didn't request a password reset, you can safely ignore this email.<br>
                                Your password won't be changed unless you click the link above.<br><br>
                                © 2025 Diamond Plus. All rights reserved.
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
```

---

## 6. Reauthentication Email

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <style>
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
        
        @media (prefers-color-scheme: dark) {
            .email-body { background-color: #1a1a1a !important; }
            .content-wrapper { background-color: #2a2a2a !important; color: #ffffff !important; }
            .text-primary { color: #ffffff !important; }
            .text-secondary { color: #cccccc !important; }
            .button-primary { background-color: #00dbff !important; color: #0f293d !important; }
            .alert-box { background-color: #3a2a2a !important; border-color: #ff6b6b !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; color: #1a1a1a;">
    <div class="email-body" style="background-color: #f5f5f5; padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto;">
            <tr>
                <td>
                    <div class="content-wrapper" style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <!-- Logo -->
                        <div style="text-align: center; margin-bottom: 40px;">
                            <img src="https://diamondplusportal.com/Diamondpluslogodark.svg" alt="Diamond Plus" width="200" style="max-width: 100%; height: auto;">
                        </div>
                        
                        <!-- Content -->
                        <h1 class="text-primary" style="color: #0f293d; font-size: 28px; font-weight: 700; text-align: center; margin: 0 0 20px 0;">Security Verification Required</h1>
                        
                        <p class="text-secondary" style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0; text-align: center;">
                            For your security, we need to verify your identity before completing this sensitive action.
                        </p>
                        
                        <!-- Alert Box -->
                        <div class="alert-box" style="background-color: #fff5f5; border: 1px solid #ffdddd; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <p style="color: #cc0000; font-size: 14px; margin: 0; text-align: center;">
                                🔒 This verification was triggered by a sensitive account action
                            </p>
                        </div>
                        
                        <!-- Button -->
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="{{ .ConfirmationURL }}" class="button-primary" style="display: inline-block; background-color: #00dbff; color: #0f293d; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                Verify My Identity
                            </a>
                        </div>
                        
                        <!-- Info -->
                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; margin: 30px 0;">
                            <h3 style="color: #0f293d; font-size: 16px; margin: 0 0 15px 0;">Why am I seeing this?</h3>
                            <p style="color: #666666; font-size: 14px; line-height: 22px; margin: 0;">
                                You're seeing this because you attempted to perform a sensitive action that requires additional verification, such as:
                            </p>
                            <ul style="color: #666666; font-size: 14px; line-height: 22px; margin: 10px 0 0 0; padding-left: 20px;">
                                <li>Changing account security settings</li>
                                <li>Accessing from a new device or location</li>
                                <li>Performing administrative actions</li>
                                <li>Extended period of inactivity</li>
                            </ul>
                        </div>
                        
                        <!-- Alternative Link -->
                        <p class="text-secondary" style="color: #666666; font-size: 14px; line-height: 20px; margin: 30px 0 0 0; text-align: center;">
                            If the button doesn't work, copy and paste this link into your browser:<br>
                            <a href="{{ .ConfirmationURL }}" style="color: #00dbff; word-break: break-all;">{{ .ConfirmationURL }}</a>
                        </p>
                        
                        <!-- Footer -->
                        <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e5e5; text-align: center;">
                            <p class="text-secondary" style="color: #999999; font-size: 12px; margin: 0;">
                                If you didn't attempt this action, please secure your account immediately.<br>
                                This link expires in 30 minutes.<br><br>
                                © 2025 Diamond Plus. All rights reserved.
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
```

---

## Implementation Notes:

### 1. **Logo Hosting**:
- Upload a PNG version of your logo for better email client support
- Host it on your server at: `https://diamondplusportal.com/email-logo.png`
- Keep dimensions around 200x50px for optimal display

### 2. **Supabase Variables**:
These templates use Supabase's template variables:
- `{{ .ConfirmationURL }}` - The action URL
- `{{ .Email }}` - User's email address
- `{{ .NewEmail }}` - New email (for email change)

### 3. **Testing**:
- Test in Gmail (light and dark mode)
- Test in Outlook
- Test in Apple Mail
- Test on mobile devices

### 4. **Dark Mode Best Practices Applied**:
- Uses `color-scheme` meta tags
- Media queries for dark mode
- Avoids pure white backgrounds
- Uses semantic color classes
- Transparent elements where possible

### 5. **Accessibility**:
- Proper heading hierarchy
- Alt text on images
- Good color contrast ratios
- Clear call-to-action buttons
