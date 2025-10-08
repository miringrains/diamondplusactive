# Email Logo Solution for Light/Dark Mode

## The Problem
- SVG files don't work reliably in email clients
- We need the logo to look good in both light and dark modes
- The logo has dark blue text (#0f293d) which won't show well on dark backgrounds

## The Solution: Use Media Queries with PNG Images

### Step 1: Create Two Logo Versions
We already created these with the script:
- `logo-2x.png` - Original dark text version (for light backgrounds)
- `logo-white-2x.png` - White text version (for dark backgrounds)

### Step 2: Updated Logo HTML for All Templates

Replace the logo section in each email template with this code:

```html
<!-- Logo with Dark Mode Support -->
<div style="text-align: center; margin-bottom: 40px;">
    <!--[if !mso]><!-->
    <div class="logo-container">
        <!-- Light Mode Logo (default) -->
        <img 
            class="logo-light" 
            src="https://diamondplusportal.com/email-assets/logo-2x.png" 
            alt="Diamond Plus" 
            width="200" 
            height="50"
            style="max-width: 100%; height: auto; display: block; margin: 0 auto;"
        >
        <!-- Dark Mode Logo (hidden by default) -->
        <img 
            class="logo-dark" 
            src="https://diamondplusportal.com/email-assets/logo-white-2x.png" 
            alt="Diamond Plus" 
            width="200" 
            height="50"
            style="max-width: 100%; height: auto; display: none; margin: 0 auto;"
        >
    </div>
    <!--<![endif]-->
    
    <!--[if mso]>
    <img 
        src="https://diamondplusportal.com/email-assets/logo-2x.png" 
        alt="Diamond Plus" 
        width="200" 
        height="50"
        style="max-width: 100%; height: auto;"
    >
    <![endif]-->
</div>
```

### Step 3: Add to CSS Section

In the `<style>` section of each template, update the dark mode media query:

```css
@media (prefers-color-scheme: dark) {
    /* Existing dark mode styles... */
    
    /* Logo switching */
    .logo-light {
        display: none !important;
    }
    .logo-dark {
        display: block !important;
    }
}

/* Additional dark mode support for some clients */
[data-ogsc] .logo-light,
[data-ogsb] .logo-light {
    display: none !important;
}
[data-ogsc] .logo-dark,
[data-ogsb] .logo-dark {
    display: block !important;
}
```

## Alternative Solution: HTML-Based Logo

If you want a pure HTML solution that doesn't require images:

```html
<!-- HTML-Based Logo -->
<div style="text-align: center; margin-bottom: 40px;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
            <td style="font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #0f293d; padding-right: 10px;">
                <span class="logo-text">Diamond</span>
            </td>
            <td style="font-size: 32px; font-weight: bold; color: #00dbff;">
                <span class="logo-plus">+</span>
            </td>
        </tr>
    </table>
</div>
```

With CSS:
```css
@media (prefers-color-scheme: dark) {
    .logo-text {
        color: #ffffff !important;
    }
    /* Plus sign stays cyan in both modes */
}
```

## Recommended Approach

Use the **PNG image solution** because:
1. It preserves your exact brand typography
2. It's more reliable across email clients
3. The file sizes are small (under 10KB)
4. It looks professional and consistent

## Implementation Checklist

1. ✅ Upload both PNG versions to your server:
   - `/email-assets/logo-2x.png` (dark text for light mode)
   - `/email-assets/logo-white-2x.png` (white text for dark mode)

2. ✅ Update all 6 email templates with the new logo HTML

3. ✅ Test in Gmail with dark mode enabled

4. ✅ Test in Outlook (uses MSO conditional comments)

5. ✅ Verify logos load quickly (under 50KB each)
