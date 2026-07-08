// lib/supabase.js
// Single shared Supabase client — avoids creating a new client per component,
// which was causing connection churn and channel re-subscription loops.
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Guard: if env vars are missing, export null so callers can short-circuit
// instead of crashing on `createClient(undefined, undefined)`.
const supabase = url && anonKey
  ? createClient(url, anonKey)
  : null;

export default supabase;
