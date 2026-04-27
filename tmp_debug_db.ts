import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugSubj() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(5);
  console.log('Profiles:', profiles);

  const { data: subjects, error: sError } = await supabase.from('subjects').select('*').limit(10);
  console.log('Recent Subjects:', subjects);

  const { data: count, error: cError } = await supabase.from('subjects').select('count', { count: 'exact', head: true });
  console.log('Total Subjects Count:', count);
}

debugSubj();
