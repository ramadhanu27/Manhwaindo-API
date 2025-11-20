// API Client for Manhwaindo API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apimanhwa.netlify.app';

export async function getLatest(page = 1) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/latest?page=${page}`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    if (!res.ok) throw new Error('Failed to fetch latest');
    return await res.json();
  } catch (error) {
    console.error('Error fetching latest:', error);
    return { success: false, data: [] };
  }
}

export async function getLastUpdate(page = 1) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/lastupdate?page=${page}`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    if (!res.ok) throw new Error('Failed to fetch last update');
    return await res.json();
  } catch (error) {
    console.error('Error fetching last update:', error);
    return { success: false, data: [] };
  }
}

export async function getProject(page = 1) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/project?page=${page}`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    if (!res.ok) throw new Error('Failed to fetch project');
    return await res.json();
  } catch (error) {
    console.error('Error fetching project:', error);
    return { success: false, data: [] };
  }
}

export async function getPopular() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/popular`, {
      next: { revalidate: 600 } // Cache for 10 minutes
    });
    if (!res.ok) throw new Error('Failed to fetch popular');
    return await res.json();
  } catch (error) {
    console.error('Error fetching popular:', error);
    return { success: false, data: [] };
  }
}

export async function getSeriesDetail(slug) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/series/${slug}`, {
      next: { revalidate: 300 }
    });
    if (!res.ok) throw new Error('Failed to fetch series detail');
    return await res.json();
  } catch (error) {
    console.error('Error fetching series detail:', error);
    return { success: false, data: null };
  }
}

export async function getChapterImages(slug) {
  if (!slug) {
    console.error('Chapter slug is empty');
    return { success: false, data: { images: [] }, error: 'Invalid chapter slug' };
  }

  const url = `${API_BASE_URL}/api/chapter/${slug}`;
  console.log('Fetching chapter images from:', url);
  
  try {
    const res = await fetch(url, {
      cache: 'no-store' // Disable cache for debugging
    });
    
    console.log('Chapter response status:', res.status, res.ok);
    
    if (!res.ok) {
      console.error('Chapter fetch failed:', res.status, res.statusText);
      return { success: false, data: { images: [] }, error: `HTTP ${res.status}` };
    }
    
    const text = await res.text();
    console.log('Raw response:', text.substring(0, 200));
    
    if (!text) {
      console.error('Empty response from API');
      return { success: false, data: { images: [] }, error: 'Empty response' };
    }

    const data = JSON.parse(text);
    console.log('Parsed chapter data:', { 
      success: data.success, 
      imageCount: data.data?.images?.length || data.images?.length,
      hasImages: !!(data.data?.images || data.images)
    });
    
    // Normalize response structure
    if (data.success && data.data && !data.data.images && data.images) {
      data.data.images = data.images;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getChapterImages:', error.message, error.stack);
    return { success: false, data: { images: [] }, error: error.message };
  }
}

export async function searchSeries(query) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`, {
      next: { revalidate: 300 }
    });
    if (!res.ok) throw new Error('Failed to search series');
    return await res.json();
  } catch (error) {
    console.error('Error searching series:', error);
    return { success: false, data: [] };
  }
}
