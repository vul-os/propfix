import { createClient } from '@supabase/supabase-js';
import config from '../../config/config';

const { supabaseUrl, supabaseKey } = config;

export const supabase = createClient(supabaseUrl, supabaseKey);
