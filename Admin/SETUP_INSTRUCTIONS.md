# Supabase Setup Instructions

## Your Supabase Project URL
✅ **URL Configured**: `https://snlxmxzhqqracembzstf.supabase.co`

## Next Steps

### 1. Get Your Supabase Anon Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Under **Project API keys**, find the **`anon` `public`** key
5. Copy this key (it starts with `eyJ...`)

### 2. Configure in Admin Panel

**Option A: Using the Admin Panel (Recommended)**
1. Open `Admin/admin.html` in your browser
2. In the "Supabase Configuration" section:
   - **Supabase URL**: `https://snlxmxzhqqracembzstf.supabase.co` (already filled)
   - **Supabase Anon Key**: Paste your anon key here
3. Click **"Save Configuration"**
4. The credentials will be saved in your browser's localStorage

**Option B: Direct Configuration (Alternative)**
You can also edit `Admin/supabase-config.js` directly:
```javascript
const SUPABASE_URL = 'https://snlxmxzhqqracembzstf.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 3. Set Up Database Schema

1. In your Supabase Dashboard, go to **SQL Editor**
2. Open the file `Admin/supabase-schema.sql`
3. Copy the entire SQL script
4. Paste it into the SQL Editor
5. Click **Run** to execute

This will create:
- `profiles` table
- `experiences` table  
- `initiatives` table
- Storage bucket for images
- Row Level Security policies

### 4. Verify Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Verify that `site-images` bucket exists
3. If it doesn't exist, create it manually:
   - Click **"New bucket"**
   - Name: `site-images`
   - Make it **Public**

### 5. Test the Connection

1. After saving your credentials, the connection status should show:
   - ✅ **"Connected to Supabase"** (green)
2. If you see an error, check:
   - URL is correct
   - Anon key is correct
   - Database schema has been run
   - Storage bucket exists

## Security Note

⚠️ **Important**: The anon key is safe to use in client-side code, but you should:
- Never commit your service role key to version control
- Set up proper Row Level Security (RLS) policies
- Consider adding authentication for admin access in production

## Troubleshooting

**Connection Issues:**
- Verify URL format: `https://xxxxx.supabase.co`
- Check anon key starts with `eyJ`
- Ensure project is active in Supabase dashboard

**Database Errors:**
- Make sure you've run the SQL schema
- Check that tables exist in **Table Editor**

**Image Upload Issues:**
- Verify `site-images` bucket exists
- Check bucket is set to **Public**
- Review storage policies in **Storage** → **Policies**

