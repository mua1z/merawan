# Admin Panel - Supabase Integration

This admin panel allows you to manage your website content using Supabase as the backend database.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be fully provisioned

### 2. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file `supabase-schema.sql` from this folder
3. Copy and paste the entire SQL script into the SQL Editor
4. Click **Run** to execute the script
5. This will create:
   - `profiles` table
   - `experiences` table
   - `initiatives` table
   - Storage bucket for images
   - Row Level Security (RLS) policies

### 3. Configure Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** (e.g., `https://xxxxx.supabase.co`)
3. Copy your **anon/public key** (under Project API keys)
4. Open `Admin/admin.html` in your browser
5. Enter your Supabase URL and Anon Key in the configuration section
6. Click **Save Configuration**

The credentials will be saved in your browser's localStorage for future use.

### 4. Storage Bucket Setup

The SQL script should automatically create the storage bucket, but if needed:

1. Go to **Storage** in your Supabase dashboard
2. Verify that `site-images` bucket exists
3. If it doesn't exist, create it manually and make it public

### 5. Using the Admin Panel

1. Open `Admin/admin.html` in your browser
2. Configure your Supabase credentials (first time only)
3. Start managing your content:
   - **Profile**: Update name, role, bio, and profile image
   - **Experiences**: Add work experiences with images
   - **Initiatives**: Add initiatives with images

### Features

- ✅ Profile management with multilingual support
- ✅ Experience management with images and tags
- ✅ Initiative management with images and impact metrics
- ✅ Image upload to Supabase Storage
- ✅ Real-time data sync
- ✅ Export/Import JSON functionality
- ✅ Responsive design

### Image Upload

Images are automatically uploaded to Supabase Storage in the `site-images` bucket:
- Profile images: `profile/`
- Experience images: `experiences/`
- Initiative images: `initiatives/`

### Security Notes

- The current setup uses public read access for all data
- For production, you should:
  - Set up proper authentication
  - Implement Row Level Security (RLS) policies
  - Use service role key for admin operations (never expose this in client-side code)
  - Consider using Supabase Auth for admin access

### Troubleshooting

**Connection Issues:**
- Verify your Supabase URL and key are correct
- Check that your Supabase project is active
- Ensure RLS policies allow public read access

**Image Upload Issues:**
- Verify the `site-images` bucket exists
- Check bucket is set to public
- Ensure storage policies allow uploads

**Data Not Loading:**
- Check browser console for errors
- Verify database tables exist
- Check RLS policies are set correctly

