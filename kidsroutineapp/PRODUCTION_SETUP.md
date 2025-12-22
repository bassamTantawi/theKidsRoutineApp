# Production Setup Guide

## Environment Variables for Production

You need to set the following environment variables in your deployment platform:

- `BOTPRESS_TOKEN` - Your Botpress token (PAT or Bot Access Key)
- `BOTPRESS_BOT_ID` - Your Botpress Bot ID (found in your bot's settings/dashboard)

**⚠️ Important:** Never commit these values to git. They are secrets and should only be set as environment variables.

## Option 1: Bot Access Key (Recommended for Production)

**Why use Bot Access Key?**
- More secure: Only has access to your specific bot's actions
- Limited scope: Can only access tables API, runtime API, and files API
- Better for production: Less risk if compromised

**How to get Bot Access Key:**
1. Go to https://app.botpress.cloud/dashboard
2. Select your bot
3. Go to **Settings** → **Access Keys** (or **Configuration** → **Access Keys**)
4. Generate a new Bot Access Key
5. Copy the key (you won't see it again!)

## Option 2: Personal Access Token (PAT)

You can use the same PAT you're using for development, but it's less secure as it has broader access.

## Setting Environment Variables by Platform

### Vercel

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add the following:
   - **Name:** `BOTPRESS_TOKEN`
   - **Value:** Your Bot Access Key or PAT
   - **Environment:** Production (and Preview if needed)
5. Add:
   - **Name:** `BOTPRESS_BOT_ID`
   - **Value:** Your Bot ID (found in Botpress dashboard → Your Bot → Settings)
   - **Environment:** Production (and Preview if needed)
6. Click **Save**
7. Redeploy your application

### Netlify

1. Go to your site on [Netlify Dashboard](https://app.netlify.com)
2. Go to **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Add:
   - **Key:** `BOTPRESS_TOKEN`
   - **Value:** Your Bot Access Key or PAT
   - **Scopes:** Production, Deploy previews, Branch deploys (as needed)
5. Add:
   - **Key:** `BOTPRESS_BOT_ID`
   - **Value:** Your Bot ID (found in Botpress dashboard → Your Bot → Settings)
   - **Scopes:** Production, Deploy previews, Branch deploys (as needed)
6. Click **Save**
7. Trigger a new deployment

### Other Platforms (Railway, Render, etc.)

1. Find the **Environment Variables** or **Config** section in your platform
2. Add:
   - `BOTPRESS_TOKEN` = Your Bot Access Key or PAT
   - `BOTPRESS_BOT_ID` = Your Bot ID (found in Botpress dashboard → Your Bot → Settings)
3. Save and redeploy

## Security Best Practices

1. **Use Bot Access Key for production** - More secure than PAT
2. **Never commit tokens or Bot ID to git** - Already handled by `.gitignore` (all `.env*` files are ignored)
3. **Rotate tokens periodically** - Generate new keys and update environment variables
4. **Use different tokens for dev/staging/prod** - Better security isolation
5. **Monitor token usage** - Check Botpress dashboard for unusual activity
6. **Keep Bot ID secret** - Treat `BOTPRESS_BOT_ID` as sensitive information

## Testing Production

After setting environment variables:
1. Deploy your application
2. Visit your production URL
3. Check the calendar - it should load events from Botpress
4. Check browser console and server logs for any errors

## Troubleshooting

If events aren't loading:
1. Verify environment variables are set correctly
2. Check that the bot is deployed and the EventsTable exists
3. Run the `seed_events` workflow to populate data
4. Check server logs for authentication errors
5. Verify the Bot Access Key has proper permissions

