// Admin.js - Supabase-powered content management

let supabase = null;
const BUCKET_NAME = 'site-images';

// Initialize Supabase
function initSupabase() {
  // Try to load from localStorage first
  const savedUrl = localStorage.getItem('supabase_url');
  const savedKey = localStorage.getItem('supabase_key');
  
  if (savedUrl && savedKey) {
    try {
      supabase = window.supabase.createClient(savedUrl, savedKey);
      updateConnectionStatus(true);
      loadAllData();
      return true;
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      updateConnectionStatus(false, error.message);
      return false;
    }
  }
  
  updateConnectionStatus(false, 'Please configure Supabase credentials');
  return false;
}

// Update connection status
function updateConnectionStatus(connected, message = '') {
  const statusEl = document.getElementById('connection-status');
  if (!statusEl) return;
  
  if (connected) {
    statusEl.innerHTML = '<span class="bg-green-500 px-3 py-1 rounded">✓ Connected to Supabase</span>';
  } else {
    statusEl.innerHTML = `<span class="bg-red-500 px-3 py-1 rounded">✗ ${message || 'Not Connected'}</span>`;
  }
}

// Upload image to Supabase Storage
async function uploadImage(file, folder = '') {
  if (!file || !supabase) return null;
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    showStatus('image-upload-status', 'Failed to upload image: ' + error.message, 'error');
    return null;
  }
}

// Show status message
function showStatus(elementId, message, type = 'success') {
  const statusEl = document.getElementById(elementId);
  if (!statusEl) return;
  
  statusEl.className = `mt-2 text-sm ${type === 'error' ? 'text-red-600' : 'text-green-600'}`;
  statusEl.textContent = message;
  
  setTimeout(() => {
    statusEl.textContent = '';
  }, 5000);
}

// Load Profile
async function loadProfile() {
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      document.getElementById('profile-name').value = data.name || '';
      document.getElementById('profile-role').value = data.role || '';
      document.getElementById('profile-bio-en').value = data.bio_en || '';
      document.getElementById('profile-bio-om').value = data.bio_om || '';
      document.getElementById('profile-bio-am').value = data.bio_am || '';
      
      if (data.image_url) {
        const preview = document.getElementById('profile-preview');
        preview.src = data.image_url;
        preview.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    showStatus('profile-status', 'Failed to load profile: ' + error.message, 'error');
  }
}

// Save Profile
async function saveProfile() {
  if (!supabase) {
    alert('Please configure Supabase first');
    return;
  }
  
  const name = document.getElementById('profile-name').value.trim();
  const role = document.getElementById('profile-role').value.trim();
  const bioEn = document.getElementById('profile-bio-en').value.trim();
  const bioOm = document.getElementById('profile-bio-om').value.trim();
  const bioAm = document.getElementById('profile-bio-am').value.trim();
  const imageFile = document.getElementById('profile-image').files[0];
  
  if (!name) {
    showStatus('profile-status', 'Name is required', 'error');
    return;
  }
  
  try {
    showStatus('profile-status', 'Saving profile...', 'success');
    
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, 'profile');
      if (imageUrl) {
        const preview = document.getElementById('profile-preview');
        preview.src = imageUrl;
        preview.style.display = 'block';
      }
    }
    
    // Check if profile exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();
    
    const profileData = {
      name,
      role,
      bio_en: bioEn,
      bio_om: bioOm,
      bio_am: bioAm,
      updated_at: new Date().toISOString()
    };
    
    if (imageUrl) {
      profileData.image_url = imageUrl;
    }
    
    let result;
    if (existing) {
      // Update existing
      result = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', existing.id);
    } else {
      // Insert new
      result = await supabase
        .from('profiles')
        .insert([profileData]);
    }
    
    if (result.error) throw result.error;
    
    showStatus('profile-status', 'Profile saved successfully!', 'success');
    document.getElementById('profile-image').value = '';
  } catch (error) {
    console.error('Error saving profile:', error);
    showStatus('profile-status', 'Failed to save profile: ' + error.message, 'error');
  }
}

// Load Experiences
async function loadExperiences() {
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    renderExperiences(data || []);
  } catch (error) {
    console.error('Error loading experiences:', error);
    showStatus('exp-status', 'Failed to load experiences: ' + error.message, 'error');
  }
}

// Render Experiences
function renderExperiences(experiences) {
  const container = document.getElementById('experience-items');
  container.innerHTML = '';
  
  if (experiences.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">No experiences yet. Add your first experience above!</p>';
    return;
  }
  
  experiences.forEach((exp) => {
    const el = document.createElement('div');
    el.className = 'p-4 border border-gray-300 rounded-lg hover:shadow-md transition bg-gray-50';
    el.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-semibold text-lg text-gray-900">${exp.title || exp.title_en || 'Untitled'}</h3>
            ${exp.period ? `<span class="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">${exp.period}</span>` : ''}
          </div>
          <p class="text-sm text-gray-700 mb-2">${(exp.description || exp.description_en || '').substring(0, 150)}${(exp.description || exp.description_en || '').length > 150 ? '...' : ''}</p>
          ${exp.tags && exp.tags.length > 0 ? `<div class="flex flex-wrap gap-1 mt-2">${exp.tags.map(tag => `<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${tag}</span>`).join('')}</div>` : ''}
          ${exp.image_url ? `<img src="${exp.image_url}" alt="${exp.title}" class="mt-2 w-32 h-20 object-cover rounded border" />` : ''}
        </div>
        <button data-id="${exp.id}" class="del-exp ml-4 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm">
          <i class="fas fa-trash mr-1"></i>Delete
        </button>
    </div>
    `;
    container.appendChild(el);
  });
  
  // Wire delete buttons
  document.querySelectorAll('.del-exp').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this experience?')) return;
      await deleteExperience(btn.dataset.id);
    });
  });
}

// Add Experience
async function addExperience() {
  if (!supabase) {
    alert('Please configure Supabase first');
    return;
  }
  
    const title = document.getElementById('exp-title').value.trim();
    const period = document.getElementById('exp-period').value.trim();
    const description = document.getElementById('exp-desc').value.trim();
  const descriptionOm = document.getElementById('exp-desc-om').value.trim();
  const descriptionAm = document.getElementById('exp-desc-am').value.trim();
  const tagsInput = document.getElementById('exp-tags').value.trim();
    const imageFile = document.getElementById('exp-image').files[0];
  
  if (!title) {
    showStatus('exp-status', 'Title is required', 'error');
    return;
  }
  
  try {
    showStatus('exp-status', 'Adding experience...', 'success');
    
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, 'experiences');
    }
    
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    // Get max order_index
    const { data: existing } = await supabase
      .from('experiences')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
    
    const orderIndex = existing ? (existing.order_index || 0) + 1 : 0;
    
    const { data, error } = await supabase
      .from('experiences')
      .insert([{
        title,
        title_en: title,
        period,
        description,
        description_en: description,
        description_om: descriptionOm,
        description_am: descriptionAm,
        image_url: imageUrl,
        tags,
        order_index: orderIndex
      }]);
    
    if (error) throw error;
    
    showStatus('exp-status', 'Experience added successfully!', 'success');
    
    // Clear form
    document.getElementById('exp-title').value = '';
    document.getElementById('exp-period').value = '';
    document.getElementById('exp-desc').value = '';
    document.getElementById('exp-desc-om').value = '';
    document.getElementById('exp-desc-am').value = '';
    document.getElementById('exp-tags').value = '';
    document.getElementById('exp-image').value = '';
    document.getElementById('exp-preview').style.display = 'none';
    
    await loadExperiences();
  } catch (error) {
    console.error('Error adding experience:', error);
    showStatus('exp-status', 'Failed to add experience: ' + error.message, 'error');
  }
}

// Delete Experience
async function deleteExperience(id) {
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    showStatus('exp-status', 'Experience deleted successfully!', 'success');
    await loadExperiences();
  } catch (error) {
    console.error('Error deleting experience:', error);
    showStatus('exp-status', 'Failed to delete experience: ' + error.message, 'error');
  }
}

// Load Initiatives
async function loadInitiatives() {
  if (!supabase) return;
  
  try {
    const { data, error } = await supabase
      .from('initiatives')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    
    renderInitiatives(data || []);
  } catch (error) {
    console.error('Error loading initiatives:', error);
    showStatus('init-status', 'Failed to load initiatives: ' + error.message, 'error');
  }
}

// Render Initiatives
function renderInitiatives(initiatives) {
  const container = document.getElementById('initiative-items');
  container.innerHTML = '';
  
  if (initiatives.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">No initiatives yet. Add your first initiative above!</p>';
    return;
  }
  
  initiatives.forEach((init) => {
    const el = document.createElement('div');
    el.className = 'p-4 border border-gray-300 rounded-lg hover:shadow-md transition bg-gray-50';
    el.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-semibold text-lg text-gray-900">${init.title || init.title_en || 'Untitled'}</h3>
            ${init.impact ? `<span class="text-sm text-green-600 bg-green-100 px-2 py-1 rounded font-medium">${init.impact}</span>` : ''}
          </div>
          <p class="text-sm text-gray-700 mb-2">${(init.description || init.description_en || '').substring(0, 150)}${(init.description || init.description_en || '').length > 150 ? '...' : ''}</p>
          ${init.image_url ? `<img src="${init.image_url}" alt="${init.title}" class="mt-2 w-32 h-20 object-cover rounded border" />` : ''}
        </div>
        <button data-id="${init.id}" class="del-init ml-4 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm">
          <i class="fas fa-trash mr-1"></i>Delete
        </button>
      </div>
    `;
    container.appendChild(el);
  });
  
  // Wire delete buttons
  document.querySelectorAll('.del-init').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this initiative?')) return;
      await deleteInitiative(btn.dataset.id);
    });
  });
}

// Add Initiative
async function addInitiative() {
  if (!supabase) {
    alert('Please configure Supabase first');
    return;
  }
  
    const title = document.getElementById('init-title').value.trim();
    const description = document.getElementById('init-desc').value.trim();
  const descriptionOm = document.getElementById('init-desc-om').value.trim();
  const descriptionAm = document.getElementById('init-desc-am').value.trim();
  const impact = document.getElementById('init-impact').value.trim();
    const imageFile = document.getElementById('init-image').files[0];
  
  if (!title) {
    showStatus('init-status', 'Title is required', 'error');
    return;
  }
  
  try {
    showStatus('init-status', 'Adding initiative...', 'success');
    
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, 'initiatives');
    }
    
    // Get max order_index
    const { data: existing } = await supabase
      .from('initiatives')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
    
    const orderIndex = existing ? (existing.order_index || 0) + 1 : 0;
    
    const { data, error } = await supabase
      .from('initiatives')
      .insert([{
        title,
        title_en: title,
        description,
        description_en: description,
        description_om: descriptionOm,
        description_am: descriptionAm,
        image_url: imageUrl,
        impact,
        order_index: orderIndex
      }]);
    
    if (error) throw error;
    
    showStatus('init-status', 'Initiative added successfully!', 'success');
    
    // Clear form
    document.getElementById('init-title').value = '';
    document.getElementById('init-desc').value = '';
    document.getElementById('init-desc-om').value = '';
    document.getElementById('init-desc-am').value = '';
    document.getElementById('init-impact').value = '';
    document.getElementById('init-image').value = '';
    document.getElementById('init-preview').style.display = 'none';
    
    await loadInitiatives();
  } catch (error) {
    console.error('Error adding initiative:', error);
    showStatus('init-status', 'Failed to add initiative: ' + error.message, 'error');
  }
}

// Delete Initiative
async function deleteInitiative(id) {
  if (!supabase) return;
  
  try {
    const { error } = await supabase
      .from('initiatives')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    showStatus('init-status', 'Initiative deleted successfully!', 'success');
    await loadInitiatives();
  } catch (error) {
    console.error('Error deleting initiative:', error);
    showStatus('init-status', 'Failed to delete initiative: ' + error.message, 'error');
  }
}

// Load all data
async function loadAllData() {
  await Promise.all([
    loadProfile(),
    loadExperiences(),
    loadInitiatives()
  ]);
}

// Image preview handlers
function setupImagePreviews() {
  // Profile image preview
  document.getElementById('profile-image')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('profile-preview');
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Experience image preview
  document.getElementById('exp-image')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('exp-preview');
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Initiative image preview
  document.getElementById('init-image')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = document.getElementById('init-preview');
        preview.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    }
  });
}

// Export/Import functions
async function exportData() {
  if (!supabase) {
    alert('Please configure Supabase first');
    return;
  }
  
  try {
    const [profileRes, expRes, initRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('experiences').select('*'),
      supabase.from('initiatives').select('*')
    ]);
    
    const data = {
      profile: profileRes.data?.[0] || null,
      experiences: expRes.data || [],
      initiatives: initRes.data || []
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'siteData.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert('Failed to export data: ' + error.message);
  }
}

async function importData(file) {
  if (!supabase) {
    alert('Please configure Supabase first');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      // Import profile
      if (data.profile) {
        const { id, ...profileData } = data.profile;
        const existing = await supabase.from('profiles').select('id').limit(1).single();
        if (existing.data) {
          await supabase.from('profiles').update(profileData).eq('id', existing.data.id);
        } else {
          await supabase.from('profiles').insert([profileData]);
        }
      }
      
      // Import experiences
      if (data.experiences && data.experiences.length > 0) {
        const experiences = data.experiences.map(({ id, ...exp }) => exp);
        await supabase.from('experiences').insert(experiences);
      }
      
      // Import initiatives
      if (data.initiatives && data.initiatives.length > 0) {
        const initiatives = data.initiatives.map(({ id, ...init }) => init);
        await supabase.from('initiatives').insert(initiatives);
      }
      
      alert('Data imported successfully!');
      await loadAllData();
    } catch (error) {
      alert('Failed to import data: ' + error.message);
    }
  };
  reader.readAsText(file);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Load saved config
  const savedUrl = localStorage.getItem('supabase_url');
  const savedKey = localStorage.getItem('supabase_key');
  
  if (savedUrl) document.getElementById('supabase-url').value = savedUrl;
  if (savedKey) document.getElementById('supabase-key').value = savedKey;
  
  // Save config button
  document.getElementById('save-config')?.addEventListener('click', () => {
    const url = document.getElementById('supabase-url').value.trim();
    const key = document.getElementById('supabase-key').value.trim();
    
    if (!url || !key) {
      alert('Please enter both URL and Key');
      return;
    }
    
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    
    initSupabase();
    alert('Configuration saved!');
  });
  
  // Initialize Supabase
  initSupabase();
  
  // Setup event listeners
  document.getElementById('save-profile')?.addEventListener('click', saveProfile);
  document.getElementById('add-experience')?.addEventListener('click', addExperience);
  document.getElementById('add-initiative')?.addEventListener('click', addInitiative);
  
  // Export/Import
  document.getElementById('export-data')?.addEventListener('click', exportData);
  document.getElementById('import-btn')?.addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file')?.addEventListener('change', (e) => {
    if (e.target.files[0]) importData(e.target.files[0]);
  });
  
  // Refresh data
  document.getElementById('refresh-data')?.addEventListener('click', loadAllData);
  
  // Clear data (with confirmation)
  document.getElementById('clear-data')?.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete ALL data? This cannot be undone!')) return;
    if (!supabase) return;
    
    try {
      await Promise.all([
        supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('experiences').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('initiatives').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);
      
      alert('All data cleared!');
      await loadAllData();
    } catch (error) {
      alert('Failed to clear data: ' + error.message);
    }
  });
  
  // Setup image previews
  setupImagePreviews();
});
