import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// 간단 테스트
async function test() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  console.log(data, error);
}
test();