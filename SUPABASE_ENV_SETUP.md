# Supabase Environment Variables Setup

To complete the Supabase authentication setup for diamondplusportal.com, you need to add the following environment variables to your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://birthcsvtmayyxrzzyhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpcnRoY3N2dG1heXl4cnp6eWhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNzU2MjgsImV4cCI6MjA3Mzk1MTYyOH0.rqvnSSt5as1JBiqqEH02ktTwfdUvqp7armaImUizFfA

# Optional: Add your service role key for server-side operations
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Important Notes:

1. **Create a `.env.local` file** in the root of your project if it doesn't exist
2. **Add the environment variables** above to the file
3. **Restart your development server** after adding the variables
4. **For production**, add these variables to your deployment platform (Vercel, etc.)

## Production Deployment

When deploying to production:

1. Add these environment variables to your hosting platform
2. Ensure HTTPS is enabled (required for secure cookies)
3. Update your Supabase project settings to allow your production domain

## Existing OpenAI Key

If you already have an OpenAI key in your environment, make sure it's also included:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```
