// Supabase Configuration
// Replace these with your actual Supabase project credentials

const SUPABASE_URL = 'https://snlxmxzhqqracembzstf.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Get this from Supabase Dashboard > Settings > API > anon/public key

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
}

