import { sql } from './src/lib/db';

async function test() {
  const months = 6;
  const now = new Date();
  
  const result = await sql`
    SELECT 
      EXTRACT(MONTH FROM COALESCE(published_at, created_at)) as month_num,
      SUM(view_count) as total_views
    FROM articles
    WHERE status = 'PUBLISHED'
      AND deleted_at IS NULL
      AND COALESCE(published_at, created_at) >= ${new Date(now.getFullYear(), now.getMonth() - months + 1, 1).toISOString()}
    GROUP BY EXTRACT(MONTH FROM COALESCE(published_at, created_at))
    ORDER BY month_num ASC
  `;
  
  console.log("Query result:", result);

  const monthLabels: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleDateString('id-ID', { month: 'short' });
    monthLabels.push(monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1, 3));
  }
  
  const viewsByMonth = new Map();
  result.forEach((row: any) => {
    viewsByMonth.set(parseInt(row.month_num), parseInt(row.total_views) || 0);
  });
  
  const currentMonth = now.getMonth() + 1;
  const data: Array<{ month: string; views: number }> = [];
  
  for (let i = 0; i < months; i++) {
    const oldMonthIndex = ((currentMonth - months + i + 12) % 12) || 12;
    const newMonthIndex = ((currentMonth - months + i + 1 + 12) % 12) || 12;
    
    console.log(`i=${i}, label=${monthLabels[i]}, oldMonthIndex=${oldMonthIndex}, newMonthIndex=${newMonthIndex}`);
    
    const label = monthLabels[i];
    const views = viewsByMonth.get(newMonthIndex) || 0;
    data.push({ month: label, views });
  }
  
  console.log("Final data:", data);
}

test().catch(console.error);
