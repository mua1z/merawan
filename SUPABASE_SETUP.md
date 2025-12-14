# Supabase Integration Setup

Your website now fetches content dynamically from Supabase! When you update content in the Admin panel, it will appear instantly on the main site.

## Quick Setup

### 1. Configure Supabase in Admin Panel

1. Open `Admin/admin.html` in your browser
2. Enter your Supabase credentials:
   - **URL**: `https://snlxmxzhqqracembzstf.supabase.co` (already pre-filled)
   - **Anon Key**: Get this from your Supabase Dashboard → Settings → API
3. Click **"Save Configuration"**

The key will be automatically saved and used by the main website.

### 2. Set Up Database

1. In Supabase Dashboard → **SQL Editor**
2. Copy and run the SQL from `Admin/supabase-schema.sql`
3. This creates the necessary tables and storage bucket

### 3. Add Content

1. Use the Admin panel to add:
   - **Profile**: Name, role, bio (multilingual)
   - **Experiences**: Work history with images
   - **Initiatives**: Projects with images

### 4. View on Main Site

1. Open `index.html` in your browser
2. Content will automatically load from Supabase
3. Changes made in Admin panel appear instantly!

## Features

✅ **Real-time Updates**: Changes in admin panel appear instantly on the main site
✅ **Multilingual Support**: Content supports English, Oromo, and Amharic
✅ **Image Upload**: Images are stored in Supabase Storage
✅ **Dynamic Rendering**: All content is fetched and rendered dynamically
✅ **Fallback Content**: If Supabase is not configured, static content is shown

## How It Works

1. **On Page Load**: The site checks for Supabase configuration
2. **Data Fetching**: Loads profile, experiences, and initiatives from Supabase
3. **Real-time Subscriptions**: Listens for changes and updates automatically
4. **Language Switching**: Content updates when language is changed

## Troubleshooting

**Content not loading?**
- Check browser console for errors
- Verify Supabase key is saved (check localStorage)
- Ensure database tables exist
- Check that RLS policies allow public read access

**Images not showing?**
- Verify `site-images` bucket exists
- Check bucket is set to public
- Verify image URLs are correct

**Real-time not working?**
- Check Supabase connection status
- Verify you're using the correct anon key
- Check browser console for subscription errors

