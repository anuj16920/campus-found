import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { config } from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Upload image - backend handles upload to Supabase
// NOTE: authMiddleware is applied globally to this router in index.js
router.post('/image', async (req, res) => {
  try {
    const { image, filename, contentType } = req.body;
    
    if (!image || !filename || !contentType) {
      return res.status(400).json({ error: 'Image data, filename, and contentType required' });
    }

    if (!config.ALLOWED_FILE_TYPES.includes(contentType)) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        allowed: config.ALLOWED_FILE_TYPES 
      });
    }

    const ext = filename.split('.').pop() || 'jpg';
    const key = `uploads/${Date.now()}-${uuidv4()}.${ext}`;

    // Decode base64 image
    const imageBuffer = Buffer.from(image, 'base64');

    // Upload to Supabase Storage using admin client
    const { data, error } = await supabaseAdmin
      .storage
      .from(config.UPLOAD_BUCKET)
      .upload(key, imageBuffer, {
        contentType,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: 'Failed to upload image: ' + error.message });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin
      .storage
      .from(config.UPLOAD_BUCKET)
      .getPublicUrl(key);

    res.json({
      key,
      public_url: urlData.publicUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image: ' + error.message });
  }
});

// Legacy endpoint - returns URL for client-side upload (using signed URL)
router.post('/image-url', async (req, res) => {
  try {
    const { filename, content_type } = req.body;
    
    if (!filename || !content_type) {
      return res.status(400).json({ error: 'Filename and content_type required' });
    }

    if (!config.ALLOWED_FILE_TYPES.includes(content_type)) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        allowed: config.ALLOWED_FILE_TYPES 
      });
    }

    const ext = filename.split('.').pop() || 'jpg';
    const key = `uploads/${Date.now()}-${uuidv4()}.${ext}`;

    // Use signed URL for upload
    const { data, error } = await supabaseAdmin
      .storage
      .from(config.UPLOAD_BUCKET)
      .createSignedUploadUrl(key);

    if (error) {
      console.error('Signed URL error:', error);
      return res.status(500).json({ error: 'Failed to create upload URL' });
    }

    res.json({
      upload_url: data.uploadUrl,
      key,
      public_url: `${config.SUPABASE_URL}/storage/v1/object/public/${config.UPLOAD_BUCKET}/${key}`
    });
  } catch (error) {
    console.error('Upload URL error:', error);
    res.status(500).json({ error: 'Failed to create upload URL' });
  }
});

// Get public URL for an image
router.get('/public-url', async (req, res) => {
  try {
    const { key } = req.query;
    
    if (!key) {
      return res.status(400).json({ error: 'Key required' });
    }

    const { data, error } = supabaseAdmin
      .storage
      .from(config.UPLOAD_BUCKET)
      .getPublicUrl(key);

    if (error) {
      console.error('Public URL error:', error);
      return res.status(500).json({ error: 'Failed to get public URL' });
    }

    res.json({ public_url: data.publicUrl });
  } catch (error) {
    console.error('Public URL error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete image
router.delete('/:key(*)', async (req, res) => {
  try {
    const { key } = req.params;
    const decodedKey = decodeURIComponent(key);

    const { error } = await supabaseAdmin
      .storage
      .from(config.UPLOAD_BUCKET)
      .remove([decodedKey]);

    if (error) {
      console.error('Delete image error:', error);
      return res.status(500).json({ error: 'Failed to delete image' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List images for user (pagination)
router.get('/images', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data, error } = await supabaseAdmin
      .storage
      .from(config.UPLOAD_BUCKET)
      .list('uploads', {
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('List images error:', error);
      return res.status(500).json({ error: 'Failed to list images' });
    }

    const images = data?.map(item => ({
      name: item.name,
      created_at: item.created_at,
      public_url: `${config.SUPABASE_URL}/storage/v1/object/public/${config.UPLOAD_BUCKET}/uploads/${item.name}`
    })) || [];

    res.json({ images });
  } catch (error) {
    console.error('List images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
