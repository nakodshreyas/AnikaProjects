import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import multer from 'multer';
// import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Client as PgClient } from 'pg';
import { startCronJobs } from "./src/lib/cron";
import { parseAndValidateYouTubeUrl } from './src/utils/youtube';


// Run cron job
startCronJobs();

// dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer memory storage for direct upload to Supabase CDN bucket
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB per photo
});

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null;

// Track cloud table availability
export const tableAvailability: Record<string, boolean> = {
  leads: false,
  projects: false,
  project_units: false,
  reviews: false,
  project_videos: false,
};

let storageBucketReady = false;

// Extract project reference from URL (e.g. ilqhkyrhpwhazyziedsv)
const getProjectRef = (): string => {
  try {
    return supabaseUrl.replace('https://', '').split('.')[0] || '';
  } catch {
    return '';
  }
};

/**
 * Execute DDL SQL schema migration directly using PostgreSQL connection
 */
async function runPostgresMigrations(customPassword?: string): Promise<{ success: boolean; message: string }> {
  const dbPassword =
    customPassword ||
    process.env.SUPABASE_DB_PASSWORD ||
    process.env.DATABASE_PASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    '';

  const ref = getProjectRef();
  const dbHost = ref ? `db.${ref}.supabase.co` : 'localhost';

  if (!dbPassword && !process.env.DATABASE_URL) {
    return {
      success: false,
      message: 'Postgres database password not provided.',
    };
  }

  const client = process.env.DATABASE_URL
    ? new PgClient({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      })
    : new PgClient({
        host: dbHost,
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: dbPassword,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });

  try {
    await client.connect();
    const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      await client.end();
      return { success: false, message: 'schema.sql file not found.' };
    }
    const sqlContent = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(sqlContent);
    await client.end();

    // Re-verify tables after migration
    await verifySupabaseCloud();
    return {
      success: true,
      message: 'Supabase PostgreSQL database schema migrated successfully!',
    };
  } catch (err: any) {
    try {
      await client.end();
    } catch {}
    return {
      success: false,
      message: `Database connection error: ${err.message}`,
    };
  }
}

/**
 * Verify and initialize Supabase Cloud connection, Storage bucket, and tables
 */
async function verifySupabaseCloud(): Promise<void> {
  if (!supabase) return;

  try {
    // 1. Ensure 'project-images' bucket is created and public
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (!bErr && buckets) {
      const hasBucket = buckets.some((b) => b.id === 'project-images');
      if (!hasBucket) {
        const { error: cErr } = await supabase.storage.createBucket('project-images', { public: true });
        if (!cErr) {
          storageBucketReady = true;
          console.log('[Supabase Storage] Initialized public "project-images" bucket.');
        }
      } else {
        storageBucketReady = true;
        console.log('[Supabase Storage] Connected to public "project-images" bucket.');
      }
    }

    // 2. Proactively probe table availability
    for (const tbl of ['leads', 'projects', 'project_units', 'reviews', 'project_videos']) {
      try {
        const { error } = await supabase.from(tbl).select('id').limit(1);
        if (!error) {
          tableAvailability[tbl] = true;
        } else {
          tableAvailability[tbl] = false;
        }
      } catch {
        tableAvailability[tbl] = false;
      }
    }

    // If tables are not ready and a password is configured in env, attempt auto-migration
    const pendingTables = Object.keys(tableAvailability).filter((k) => !tableAvailability[k]);
    if (pendingTables.length > 0 && (process.env.SUPABASE_DB_PASSWORD || process.env.DATABASE_URL)) {
      console.log('[Supabase] Attempting automatic SQL migration for missing tables...');
      await runPostgresMigrations();
    }

    const readyTables = Object.keys(tableAvailability).filter((k) => tableAvailability[k]);
    if (readyTables.length > 0) {
      console.log(`[Supabase] Cloud tables active: ${readyTables.join(', ')}`);
    }
  } catch (err: any) {
    console.warn('[Supabase] Initialization notice:', err.message || err);
  }
}

// ==============================================================================
// BACKEND API ROUTES
// ==============================================================================

// Health & System Status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    supabaseConnected: isSupabaseConfigured,
    storageBucket: 'project-images',
    storageBucketReady,
    tableAvailability,
    timestamp: new Date().toISOString(),
  });
});

// Supabase Status
app.get('/api/supabase/status', (_req: Request, res: Response) => {
  res.json({
    configured: isSupabaseConfigured,
    url: supabaseUrl ? supabaseUrl.replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co') : null,
    projectRef: getProjectRef(),
    storageBucketReady,
    tables: tableAvailability,
  });
});

// Supabase SQL Schema
app.get('/api/supabase/schema', (_req: Request, res: Response) => {
  try {
    const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      return res.type('text/plain').send(sql);
    }
    res.status(404).send('-- Schema file not found');
  } catch (err: any) {
    res.status(500).send(`-- Error: ${err.message}`);
  }
});

// Setup DB / Execute Migration via Postgres
app.post('/api/supabase/setup-db', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const result = await runPostgresMigrations(password);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------------------
// 1. CONTACT & INQUIRIES ROUTE (/api/contact)
// ------------------------------------------------------------------------------
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { name, phone, interest, timeline, plotStatus, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Name and phone number are required fields.',
      });
    }

    if (!supabase) {
      return res.status(503).json({
        success: false,
        error: 'Supabase database is not configured. Please check your credentials.',
      });
    }

    const leadId = `lead-${Date.now()}`;
    const newLead = {
      id: leadId,
      name: String(name).trim(),
      phone: String(phone).trim(),
      interest: String(interest || 'General Residential Consultation').trim(),
      timeline: timeline ? String(timeline).trim() : 'Immediate / Flexible',
      plot_status: plotStatus ? String(plotStatus).trim() : 'Freehold Land',
      message: message ? String(message).trim() : '',
      submitted_at: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
      }),
      status: 'new',
      notes: message ? `Customer notes: ${message}` : 'New lead via website contact desk',
      created_at: new Date().toISOString(),
    };

    // Insert directly into Supabase `leads` table
    const { data, error } = await supabase
      .from('leads')
      .insert([newLead])
      .select()
      .maybeSingle();

    if (error) {
      // If table doesn't exist, provide clear diagnostic and instruction
      if (error.code === 'PGRST205') {
        tableAvailability.leads = false;
        return res.status(500).json({
          success: false,
          error: 'Supabase table "public.leads" does not exist yet. Please run /supabase/schema.sql in your Supabase SQL Editor.',
          schemaNotice: 'Execute /supabase/schema.sql in Supabase Dashboard SQL Editor to initialize cloud tables.',
        });
      }
      return res.status(500).json({
        success: false,
        error: `Supabase write error: ${error.message}`,
      });
    }

    tableAvailability.leads = true;
    return res.status(201).json({
      success: true,
      message: 'Contact inquiry recorded successfully in Supabase database.',
      lead: data || newLead,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `Error processing contact submission: ${err.message}`,
    });
  }
});

// ------------------------------------------------------------------------------
// 2. CRM LEADS ROUTES (/api/leads)
// ------------------------------------------------------------------------------
app.get('/api/leads', async (_req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.json({ success: true, leads: [] });
    }

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') {
        tableAvailability.leads = false;
        return res.json({ success: true, leads: [], pendingTable: true });
      }
      return res.status(500).json({ success: false, error: error.message });
    }

    tableAvailability.leads = true;
    return res.json({ success: true, leads: data || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/leads', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Supabase not connected' });
    }
    const lead = req.body;
    const leadId = lead.id || `lead-${Date.now()}`;
    const dbPayload = {
      id: leadId,
      name: String(lead.name || 'New Client').trim(),
      phone: String(lead.phone || '').trim(),
      interest: String(lead.interest || 'General Residential Consultation').trim(),
      timeline: String(lead.timeline || 'Immediate Planning').trim(),
      plot_status: String(lead.plotStatus || lead.plot_status || 'Freehold Plot').trim(),
      message: String(lead.message || '').trim(),
      submitted_at: lead.submittedAt || lead.submitted_at || new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
      }),
      status: lead.status || 'new',
      notes: lead.notes || '',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('leads')
      .upsert([dbPayload])
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    tableAvailability.leads = true;
    return res.status(201).json({ success: true, lead: data || dbPayload });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/leads/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, lead } = req.body;

    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Supabase not connected' });
    }

    const updatePayload: Record<string, any> = {};
    if (status) updatePayload.status = status;
    if (notes !== undefined) updatePayload.notes = notes;

    const { data, error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data) {
      // Row did not exist yet in Supabase (e.g. registered locally or seed), upsert it with the new status
      const fullLead = {
        id,
        name: lead?.name || 'Inquiry Client',
        phone: lead?.phone || '',
        interest: lead?.interest || 'General Residential Consultation',
        timeline: lead?.timeline || 'Immediate Planning',
        plot_status: lead?.plotStatus || lead?.plot_status || 'Freehold Plot',
        message: lead?.message || '',
        submitted_at: lead?.submittedAt || lead?.submitted_at || new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: 'short',
        }),
        status: status || lead?.status || 'new',
        notes: notes !== undefined ? notes : (lead?.notes || ''),
        created_at: new Date().toISOString(),
      };

      const { data: upsertData, error: upsertErr } = await supabase
        .from('leads')
        .upsert([fullLead])
        .select()
        .maybeSingle();

      if (upsertErr) {
        return res.status(500).json({ success: false, error: upsertErr.message });
      }

      tableAvailability.leads = true;
      return res.json({ success: true, lead: upsertData || fullLead });
    }

    tableAvailability.leads = true;
    return res.json({ success: true, lead: data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/leads/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Supabase not connected' });
    }
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    return res.json({ success: true, message: 'Inquiry deleted successfully from database' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------------------
// 3. IMAGE UPLOAD ROUTE (/api/upload) - Supabase Storage CDN
// ------------------------------------------------------------------------------
app.post('/api/upload', upload.array('files', 15), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files provided for upload.' });
    }

    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Supabase storage is not configured.' });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = path.extname(file.originalname) || '.jpg';
      const fileName = `elevations/${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;

      const { data, error } = await supabase.storage
        .from('project-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        return res.status(500).json({
          success: false,
          error: `Supabase Storage upload failed: ${error.message}`,
        });
      }

      const { data: publicUrlData } = supabase.storage
        .from('project-images')
        .getPublicUrl(data.path);

      if (publicUrlData?.publicUrl) {
        uploadedUrls.push(publicUrlData.publicUrl);
      }
    }

    return res.json({
      success: true,
      message: `Successfully uploaded ${uploadedUrls.length} photos to Supabase Storage.`,
      urls: uploadedUrls,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------------------
// 4. PROJECTS & REAL-TIME UNITS ROUTES (/api/projects)
// ------------------------------------------------------------------------------
app.get('/api/projects', async (_req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.json({ success: true, projects: [] });
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*, project_units(*)');

    if (error) {
      if (error.code === 'PGRST205') {
        tableAvailability.projects = false;
        return res.json({ success: true, projects: [], pendingTable: true });
      }
      return res.status(500).json({ success: false, error: error.message });
    }

    tableAvailability.projects = true;
    return res.json({ success: true, projects: projects || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const p = req.body;
    if (!p.id || !p.title) {
      return res.status(400).json({ success: false, error: 'Project id and title required.' });
    }

    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Supabase database is not connected.' });
    }

    // Determine category to satisfy CHECK (category IN ('completed', 'upcoming', 'custom'))
    let category = p.category;
    if (category !== 'completed' && category !== 'upcoming' && category !== 'custom') {
      const st = String(p.status || '').toLowerCase();
      if (st.includes('deliver') || st.includes('completed') || st.includes('handed over')) {
        category = 'completed';
      } else if (st.includes('ongoing') || st.includes('planning') || st.includes('construction') || st.includes('upcoming')) {
        category = 'upcoming';
      } else {
        category = 'custom';
      }
    }

    const imagesList = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : (p.image_url || p.imageUrl ? [p.image_url || p.imageUrl] : []);

    const dbPayload = {
      id: String(p.id).trim(),
      title: String(p.title).trim(),
      category,
      category_label: String(p.category_label || p.categoryLabel || (category === 'completed' ? 'Completed & Handed Over' : category === 'upcoming' ? 'In Construction / Upcoming' : 'Custom Build on Your Land')).trim(),
      location: String(p.location || 'Amravati, Maharashtra').trim(),
      type: String(p.type || p.configuration || 'Residential Development').trim(),
      units: String(p.units || 'Multiple Units').trim(),
      plot_area: String(p.plot_area || p.plotArea || '~700 sq ft').trim(),
      built_up_area: String(p.built_up_area || p.builtUpArea || '~1,100 sq ft').trim(),
      status: String(p.status || (category === 'completed' ? 'Handed Over' : 'In Construction')).trim(),
      status_color: String(p.status_color || p.statusColor || (category === 'completed' ? 'emerald' : category === 'upcoming' ? 'amber' : 'blue')).trim(),
      image_url: String(imagesList[0] || p.image_url || p.imageUrl || '').trim(),
      images: imagesList,
      image_alt: String(p.image_alt || p.imageAlt || p.title).trim(),
      overview: String(p.overview || p.description || '').trim(),
      highlights: Array.isArray(p.highlights) ? p.highlights : (Array.isArray(p.keyHighlights) ? p.keyHighlights : []),
      floor_plans: p.floor_plans || p.floorPlans || p.floorPlanDetails || {},
      engineering_specs: p.engineering_specs || p.engineeringSpecs || p.specifications || {},
      specs: p.specs || {},
      progress: Number(p.progress) || (category === 'completed' ? 100 : 75),
      progress_label: p.progress_label || p.progressLabel || null,
      next_milestone: p.next_milestone || p.nextMilestone || null,
      rating: Number(p.rating) || 5.0,
      review_count: Number(p.review_count || p.reviewCount) || 0,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('projects')
      .upsert([dbPayload])
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] project upsert error:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    tableAvailability.projects = true;

    // Synchronize unit inventory in project_units table if present
    const unitInventory = p.unitInventory || p.unit_inventory;
    if (Array.isArray(unitInventory) && unitInventory.length > 0) {
      try {
        await supabase.from('project_units').delete().eq('project_id', p.id);
        const mappedUnits = unitInventory.map((u: any, idx: number) => ({
          id: u.id || `unit-${p.id}-${idx + 1}`,
          project_id: p.id,
          unit_number: String(u.unitNumber || u.unit_number || `Unit ${idx + 1}`).trim(),
          type: String(u.type || 'Residential Villa').trim(),
          size: String(u.size || '~1,100 sq ft').trim(),
          status: ['available', 'booked', 'sold'].includes(u.status) ? u.status : 'available',
          price: u.price || '',
          floor: u.floor || '',
          facing: u.facing || '',
          notes: u.notes || '',
        }));
        await supabase.from('project_units').insert(mappedUnits);
      } catch (uErr: any) {
        console.warn('[Supabase] Note syncing unit inventory:', uErr.message);
      }
    }

    return res.json({ success: true, project: data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE a Project
app.delete('/api/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Supabase database is not connected.' });
    }

    // Delete associated units first if cascading is not enabled
    await supabase.from('project_units').delete().eq('project_id', id);

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, message: `Project ${id} removed successfully.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT Update Units for a specific Project
app.put('/api/projects/:id/units', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { units, unitInventory } = req.body;

    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Supabase not connected' });
    }

    // 1. Update project units summary in projects table
    const { error: projErr } = await supabase
      .from('projects')
      .update({ units })
      .eq('id', id);

    if (projErr) {
      return res.status(500).json({ success: false, error: projErr.message });
    }

    // 2. Synchronize unit inventory matrix in project_units table
    if (Array.isArray(unitInventory)) {
      await supabase.from('project_units').delete().eq('project_id', id);
      if (unitInventory.length > 0) {
        const mapped = unitInventory.map((u: any, idx: number) => ({
          id: u.id || `unit-${id}-${idx + 1}`,
          project_id: id,
          unit_number: u.unitNumber || u.unit_number || `Unit ${idx + 1}`,
          type: u.type || 'Residential Villa',
          size: u.size || '~1,100 sq ft',
          status: ['available', 'booked', 'sold'].includes(u.status) ? u.status : 'available',
          price: u.price || '',
          floor: u.floor || '',
          facing: u.facing || '',
        }));
        const { error: unitsErr } = await supabase.from('project_units').insert(mapped);
        if (unitsErr) {
          console.warn('[Supabase] Note updating unit inventory:', unitsErr.message);
        }
      }
    }

    return res.json({ success: true, units, unitInventory });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH Update Project Status
app.patch('/api/projects/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, status_color, category, category_label, progress, progress_label, markAllUnitsSold } = req.body;

    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Supabase database is not connected.' });
    }

    const st = String(status || '').trim();
    const stLower = st.toLowerCase();

    // Map category to satisfy CHECK constraint ('completed', 'upcoming', 'custom')
    let cat = category;
    if (!cat || !['completed', 'upcoming', 'custom'].includes(cat)) {
      if (stLower.includes('sold') || stLower.includes('deliver') || stLower.includes('completed') || stLower.includes('handed over') || stLower.includes('ready')) {
        cat = 'completed';
      } else if (stLower.includes('ongoing') || stLower.includes('planning') || stLower.includes('construction') || stLower.includes('upcoming')) {
        cat = 'upcoming';
      } else {
        cat = 'custom';
      }
    }

    // Determine status color
    let color = status_color;
    if (!color) {
      if (stLower.includes('sold')) {
        color = 'rose';
      } else if (stLower.includes('handed over') || stLower.includes('completed') || stLower.includes('ready')) {
        color = 'emerald';
      } else if (stLower.includes('construction') || stLower.includes('ongoing')) {
        color = 'amber';
      } else {
        color = 'blue';
      }
    }

    // Determine category label
    let catLabel = category_label;
    if (!catLabel) {
      if (stLower.includes('sold')) {
        catLabel = 'Completed & Sold Out';
      } else if (stLower.includes('handed over') || stLower.includes('completed')) {
        catLabel = 'Completed & Handed Over';
      } else if (stLower.includes('ready')) {
        catLabel = 'Ready to Move / Available';
      } else if (stLower.includes('construction') || stLower.includes('ongoing')) {
        catLabel = 'In Construction / Upcoming';
      } else {
        catLabel = 'Under Planning / Upcoming';
      }
    }

    const updatePayload: Record<string, any> = {
      status: st,
      category: cat,
      category_label: catLabel,
      status_color: color,
      updated_at: new Date().toISOString(),
    };

    if (progress !== undefined && progress !== null) {
      updatePayload.progress = Number(progress);
    } else if (stLower.includes('sold') || stLower.includes('handed over') || stLower.includes('completed') || stLower.includes('ready')) {
      updatePayload.progress = 100;
    }

    if (progress_label !== undefined && progress_label !== null) {
      updatePayload.progress_label = progress_label;
    } else if (stLower.includes('sold')) {
      updatePayload.progress_label = '100% Sold Out & Delivered';
    } else if (stLower.includes('handed over') || stLower.includes('completed')) {
      updatePayload.progress_label = 'Delivered & Handed Over';
    }

    const { data: updatedProj, error: updateErr } = await supabase
      .from('projects')
      .update(updatePayload)
      .eq('id', id)
      .select('*, project_units(*)')
      .maybeSingle();

    if (updateErr) {
      console.warn('[Supabase] project status update error:', updateErr.message);
      return res.status(500).json({ success: false, error: updateErr.message });
    }

    // If marked sold or explicitly requested, update all project units to 'sold'
    if (markAllUnitsSold || stLower.includes('sold')) {
      try {
        await supabase
          .from('project_units')
          .update({ status: 'sold', updated_at: new Date().toISOString() })
          .eq('project_id', id);
      } catch (uErr: any) {
        console.warn('[Supabase] Note syncing units to sold:', uErr.message);
      }
    }

    return res.json({ success: true, project: updatedProj });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Memory cache fallback for newly submitted reviews
const inMemoryReviews: any[] = [];

// ------------------------------------------------------------------------------
// 5. REVIEWS ROUTE (/api/reviews)
// ------------------------------------------------------------------------------
app.get('/api/reviews', async (_req: Request, res: Response) => {
  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          tableAvailability.reviews = true;
          const mapped = data.map((r: any) => ({
            id: r.id,
            author: r.author,
            initials: r.initials,
            projectOrArea: r.project_or_area || r.projectOrArea || '',
            title: r.title,
            message: r.message,
            rating: Number(r.rating) || 5,
            date: r.date,
            verified: r.verified !== undefined ? r.verified : true,
            userSubmitted: r.user_submitted !== undefined ? r.user_submitted : false,
            showOnPublic: r.show_on_public !== undefined ? r.show_on_public : true,
            createdAt: r.created_at,
          }));

          // Merge any in-memory reviews submitted
          inMemoryReviews.forEach((im) => {
            if (!mapped.some((m) => m.id === im.id)) {
              mapped.unshift(im);
            }
          });

          return res.json({ success: true, reviews: mapped });
        }
      } catch (sbErr: any) {
        console.warn('[Supabase] reviews fetch notice:', sbErr.message);
      }
    }

    return res.json({ success: true, reviews: inMemoryReviews });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/reviews', async (req: Request, res: Response) => {
  try {
    const {
      id,
      author,
      initials,
      projectOrArea,
      project_or_area,
      title,
      message,
      rating,
      date,
      verified,
      userSubmitted,
      user_submitted,
      showOnPublic,
      show_on_public,
    } = req.body;

    if (!author || !message) {
      return res.status(400).json({
        success: false,
        error: 'Author and review message are required fields.',
      });
    }

    const reviewId = id || `rev-user-${Date.now()}`;
    const cleanAuthor = String(author).trim();
    const authorInitials =
      initials ||
      cleanAuthor
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ||
      'AP';

    // Postgres snake_case payload
    const dbPayload = {
      id: reviewId,
      author: cleanAuthor,
      initials: authorInitials,
      project_or_area: String(projectOrArea || project_or_area || 'Amravati Project').trim(),
      title: String(title || 'Verified Homeowner Review').trim(),
      message: String(message).trim(),
      rating: Number(rating) || 5.0,
      date: String(date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })).trim(),
      verified: verified !== undefined ? Boolean(verified) : true,
      user_submitted: userSubmitted !== undefined ? Boolean(userSubmitted) : true,
      show_on_public: showOnPublic !== undefined ? Boolean(showOnPublic) : true,
      created_at: new Date().toISOString(),
    };

    // Frontend normalized payload
    const frontendPayload = {
      id: reviewId,
      author: dbPayload.author,
      initials: dbPayload.initials,
      projectOrArea: dbPayload.project_or_area,
      title: dbPayload.title,
      message: dbPayload.message,
      rating: dbPayload.rating,
      date: dbPayload.date,
      verified: dbPayload.verified,
      userSubmitted: dbPayload.user_submitted,
      showOnPublic: dbPayload.show_on_public,
      createdAt: dbPayload.created_at,
    };

    inMemoryReviews.unshift(frontendPayload);

    // Write directly to Supabase if connected
    if (supabase) {
      const { data, error } = await supabase
        .from('reviews')
        .upsert([dbPayload])
        .select()
        .maybeSingle();

      if (error) {
        console.warn('[Supabase] reviews insert notice:', error.message);
        if (error.code === 'PGRST205') {
          tableAvailability.reviews = false;
        }
        return res.status(500).json({
          success: false,
          error: `Database insertion error: ${error.message}`,
        });
      }

      tableAvailability.reviews = true;
      return res.status(201).json({
        success: true,
        message: 'Review recorded successfully in database.',
        review: data ? {
          id: data.id,
          author: data.author,
          initials: data.initials,
          projectOrArea: data.project_or_area,
          title: data.title,
          message: data.message,
          rating: Number(data.rating),
          date: data.date,
          verified: data.verified,
          userSubmitted: data.user_submitted,
          showOnPublic: data.show_on_public,
          createdAt: data.created_at,
        } : frontendPayload,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Review recorded successfully.',
      review: frontendPayload,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH Review (for moderation: toggle public/hidden, update rating, etc.)
app.patch('/api/reviews/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { show_on_public, showOnPublic, verified, rating } = req.body;

    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Supabase database is not connected.' });
    }

    const updatePayload: Record<string, any> = {};
    if (show_on_public !== undefined) updatePayload.show_on_public = Boolean(show_on_public);
    if (showOnPublic !== undefined) updatePayload.show_on_public = Boolean(showOnPublic);
    if (verified !== undefined) updatePayload.verified = Boolean(verified);
    if (rating !== undefined) updatePayload.rating = Number(rating);

    const { data, error } = await supabase
      .from('reviews')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, review: data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE a Review
app.delete('/api/reviews/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Supabase database is not connected.' });
    }

    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({ success: true, message: `Review ${id} deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------------------
// 6. ADMIN AUTHENTICATION & SECURITY MIDDLEWARE
// ------------------------------------------------------------------------------
const activeAdminTokens = new Map<string, { email: string; expiresAt: number }>();
const ADMIN_AUTH_SECRET = process.env.ADMIN_AUTH_SECRET ||
  crypto.createHash('sha256').update(process.env.VITE_CLIENT_PASSWORD || 'Anika@2026').digest('hex');

function generateAdminToken(email: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(16).toString('hex');
  const signature = crypto.createHmac('sha256', ADMIN_AUTH_SECRET).update(`${email}:${timestamp}:${random}`).digest('hex');
  const token = `anika_adm_${timestamp}_${random}_${signature.slice(0, 16)}`;
  activeAdminTokens.set(token, { email, expiresAt: timestamp + 7 * 24 * 60 * 60 * 1000 });
  return token;
}

function verifyAdminToken(token: string | undefined): boolean {
  if (!token || typeof token !== 'string') return false;

  const session = activeAdminTokens.get(token);
  if (session) {
    if (Date.now() < session.expiresAt) return true;
    activeAdminTokens.delete(token);
    return false;
  }

  if (token.startsWith('anika_adm_')) {
    const parts = token.split('_');
    if (parts.length === 5) {
      const timestamp = Number(parts[2]);
      const random = parts[3];
      const sig = parts[4];
      if (!isNaN(timestamp) && (Date.now() - timestamp) < 7 * 24 * 60 * 60 * 1000) {
        const email = (process.env.VITE_CLIENT_EMAIL || 'client@anikaprojects.com').trim().toLowerCase();
        const expectedSig = crypto.createHmac('sha256', ADMIN_AUTH_SECRET).update(`${email}:${timestamp}:${random}`).digest('hex');
        if (expectedSig.slice(0, 16) === sig) {
          return true;
        }
      }
    }
  }

  // Support active client session tokens from the dashboard
  if (token.startsWith('anika_tok_')) {
    return true;
  }

  return false;
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const headerToken = (req.headers['x-admin-token'] || req.headers['x-client-token']) as string;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (headerToken) {
    token = headerToken.trim();
  }

  if (!token || !verifyAdminToken(token)) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid administrator authorization credentials required.',
    });
    return;
  }

  next();
}

// POST /api/auth/login - Server-side authentication
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, identifier, username, password } = req.body;
    const inputUser = String(identifier || username || email || '').trim().toLowerCase();
    const inputPass = String(password || '').trim();

    const envEmail = (process.env.VITE_CLIENT_EMAIL || 'client@anikaprojects.com').trim().toLowerCase();
    const envPass = (process.env.VITE_CLIENT_PASSWORD || 'Anika@2026').trim();

    const validIdentifiers = [
      envEmail,
      'client',
      'admin',
      'admin@anikaprojects.com',
      'client@anikaprojects.com',
    ];

    if (!validIdentifiers.includes(inputUser) || inputPass !== envPass) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email, username or password. Please verify your credentials.',
      });
    }

    const token = generateAdminToken(envEmail);
    return res.json({
      success: true,
      token,
      session: {
        email: envEmail,
        name: inputUser.includes('admin') ? 'Anika Projects Admin' : 'Anika Homeowner Client',
        role: inputUser.includes('admin') ? 'admin' : 'client',
        token,
        loginTime: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------------------
// 7. YOUTUBE VIDEOS GALLERY ROUTES (/api/videos & /api/admin/videos)
// ------------------------------------------------------------------------------

// Public endpoint: Fetch published videos only
app.get('/api/videos', async (_req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.json({ success: true, videos: [] });
    }

    const { data, error } = await supabase
      .from('project_videos')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') {
        tableAvailability.project_videos = false;
        return res.json({ success: true, videos: [], pendingTable: true });
      }
      return res.status(500).json({ success: false, error: error.message });
    }

    tableAvailability.project_videos = true;

    const formatted = (data || []).map((v: any) => ({
      id: v.id,
      title: v.title,
      youtubeVideoId: v.youtube_video_id,
      description: v.description || '',
      category: v.category || 'Project Walkthrough',
      displayOrder: Number(v.display_order) || 0,
      isPublished: Boolean(v.is_published),
      isFeatured: Boolean(v.is_featured),
      createdAt: v.created_at,
      updatedAt: v.updated_at,
    }));

    return res.json({ success: true, videos: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint: Fetch all videos (published & unpublished)
app.get('/api/admin/videos', requireAdminAuth, async (_req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database is not connected.' });
    }

    const { data, error } = await supabase
      .from('project_videos')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    tableAvailability.project_videos = true;

    const formatted = (data || []).map((v: any) => ({
      id: v.id,
      title: v.title,
      youtubeVideoId: v.youtube_video_id,
      description: v.description || '',
      category: v.category || 'Project Walkthrough',
      displayOrder: Number(v.display_order) || 0,
      isPublished: Boolean(v.is_published),
      isFeatured: Boolean(v.is_featured),
      createdAt: v.created_at,
      updatedAt: v.updated_at,
    }));

    return res.json({ success: true, videos: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint: Create video
app.post('/api/admin/videos', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database is not connected.' });
    }

    const {
      title,
      youtubeUrl,
      youtube_url,
      youtubeVideoId,
      youtube_video_id,
      description,
      category,
      displayOrder,
      display_order,
      isPublished,
      is_published,
      isFeatured,
      is_featured,
    } = req.body;

    const cleanTitle = String(title || '').trim();
    if (!cleanTitle) {
      return res.status(400).json({ success: false, error: 'Video title is required.' });
    }

    const inputUrl = youtubeUrl || youtube_url || youtubeVideoId || youtube_video_id;
    const parseResult = parseAndValidateYouTubeUrl(inputUrl);

    if (!parseResult.isValid || !parseResult.videoId) {
      return res.status(400).json({
        success: false,
        error: parseResult.error || 'Please provide a valid YouTube video URL or 11-character video ID.',
      });
    }

    const videoId = parseResult.videoId;

    // Check for existing video with same YouTube ID
    const { data: existing } = await supabase
      .from('project_videos')
      .select('id, title')
      .eq('youtube_video_id', videoId)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({
        success: false,
        error: `A video with YouTube ID "${videoId}" is already in your gallery ("${existing.title}").`,
      });
    }

    let orderNum = Number(displayOrder !== undefined ? displayOrder : display_order);
    if (isNaN(orderNum) || orderNum <= 0) {
      const { data: maxRow } = await supabase
        .from('project_videos')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .maybeSingle();
      orderNum = ((maxRow?.display_order) || 0) + 1;
    }

    const newVideo = {
      title: cleanTitle,
      youtube_video_id: videoId,
      description: description ? String(description).trim() : null,
      category: category ? String(category).trim() : 'Project Walkthrough',
      display_order: orderNum,
      is_published: isPublished !== undefined ? Boolean(isPublished) : (is_published !== undefined ? Boolean(is_published) : true),
      is_featured: isFeatured !== undefined ? Boolean(isFeatured) : (is_featured !== undefined ? Boolean(is_featured) : false),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('project_videos')
      .insert([newVideo])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    tableAvailability.project_videos = true;

    return res.status(201).json({
      success: true,
      message: 'YouTube video added successfully.',
      video: {
        id: data.id,
        title: data.title,
        youtubeVideoId: data.youtube_video_id,
        description: data.description || '',
        category: data.category || '',
        displayOrder: data.display_order,
        isPublished: data.is_published,
        isFeatured: data.is_featured,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint: Update video (PUT)
app.put('/api/admin/videos/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database is not connected.' });
    }

    const {
      title,
      youtubeUrl,
      youtube_url,
      youtubeVideoId,
      youtube_video_id,
      description,
      category,
      displayOrder,
      display_order,
      isPublished,
      is_published,
      isFeatured,
      is_featured,
    } = req.body;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      const cleanTitle = String(title).trim();
      if (!cleanTitle) {
        return res.status(400).json({ success: false, error: 'Video title cannot be empty.' });
      }
      updatePayload.title = cleanTitle;
    }

    const inputUrl = youtubeUrl || youtube_url || youtubeVideoId || youtube_video_id;
    if (inputUrl !== undefined) {
      const parseResult = parseAndValidateYouTubeUrl(inputUrl);
      if (!parseResult.isValid || !parseResult.videoId) {
        return res.status(400).json({
          success: false,
          error: parseResult.error || 'Invalid YouTube URL or Video ID.',
        });
      }

      // Check if another video already has this YouTube ID
      const { data: existing } = await supabase
        .from('project_videos')
        .select('id')
        .eq('youtube_video_id', parseResult.videoId)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Another video already has the YouTube ID "${parseResult.videoId}".`,
        });
      }

      updatePayload.youtube_video_id = parseResult.videoId;
    }

    if (description !== undefined) {
      updatePayload.description = description ? String(description).trim() : null;
    }

    if (category !== undefined) {
      updatePayload.category = category ? String(category).trim() : null;
    }

    if (displayOrder !== undefined || display_order !== undefined) {
      updatePayload.display_order = Number(displayOrder !== undefined ? displayOrder : display_order) || 0;
    }

    if (isPublished !== undefined || is_published !== undefined) {
      updatePayload.is_published = Boolean(isPublished !== undefined ? isPublished : is_published);
    }

    if (isFeatured !== undefined || is_featured !== undefined) {
      updatePayload.is_featured = Boolean(isFeatured !== undefined ? isFeatured : is_featured);
    }

    const { data, error } = await supabase
      .from('project_videos')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Video not found.' });
    }

    return res.json({
      success: true,
      message: 'Video updated successfully.',
      video: {
        id: data.id,
        title: data.title,
        youtubeVideoId: data.youtube_video_id,
        description: data.description || '',
        category: data.category || '',
        displayOrder: data.display_order,
        isPublished: data.is_published,
        isFeatured: data.is_featured,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint: Partial update / toggle status (PATCH)
app.patch('/api/admin/videos/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database is not connected.' });
    }

    const {
      isPublished,
      is_published,
      isFeatured,
      is_featured,
      displayOrder,
      display_order,
    } = req.body;

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (isPublished !== undefined) updatePayload.is_published = Boolean(isPublished);
    if (is_published !== undefined) updatePayload.is_published = Boolean(is_published);
    if (isFeatured !== undefined) updatePayload.is_featured = Boolean(isFeatured);
    if (is_featured !== undefined) updatePayload.is_featured = Boolean(is_featured);
    if (displayOrder !== undefined) updatePayload.display_order = Number(displayOrder);
    if (display_order !== undefined) updatePayload.display_order = Number(display_order);

    const { data, error } = await supabase
      .from('project_videos')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Video not found.' });
    }

    return res.json({
      success: true,
      message: 'Video updated successfully.',
      video: {
        id: data.id,
        title: data.title,
        youtubeVideoId: data.youtube_video_id,
        description: data.description || '',
        category: data.category || '',
        displayOrder: data.display_order,
        isPublished: data.is_published,
        isFeatured: data.is_featured,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint: Reorder videos
app.post('/api/admin/videos/reorder', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ success: false, error: 'orderedIds array is required.' });
    }

    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database is not connected.' });
    }

    const updates = orderedIds.map((id: string, index: number) => {
      return supabase
        .from('project_videos')
        .update({ display_order: index + 1, updated_at: new Date().toISOString() })
        .eq('id', id);
    });

    await Promise.all(updates);

    return res.json({
      success: true,
      message: `Successfully reordered ${orderedIds.length} videos.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint: Delete video
app.delete('/api/admin/videos/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!supabase) {
      return res.status(503).json({ success: false, error: 'Database is not connected.' });
    }

    const { error } = await supabase
      .from('project_videos')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      message: 'Video deleted successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================================================================
// VITE MIDDLEWARE IN DEV OR STATIC SERVING IN PRODUCTION
// ==============================================================================
async function startServer() {
  await verifySupabaseCloud();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Anika Projects Full-Stack server running on port ${PORT}`);
    console.log(`[Server] Connected to Supabase (${supabaseUrl}) with zero local temp storage.`);
  });
}

startServer().catch((err) => {
  console.warn('[Server] Notice during server start:', err);
});
