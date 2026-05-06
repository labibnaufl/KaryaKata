import { sql } from '@/lib/db';

/**
 * Get article views aggregated by month for the last 6 months
 * This uses the total view_count and distributes it based on publish date
 * For real-time tracking, you would need an article_views table
 */
export async function getArticleViewsByMonth(months: number = 6): Promise<Array<{ month: string; views: number }>> {
  // Get current date and calculate months
  const now = new Date();
  const monthLabels: string[] = [];
  const monthNumbers: number[] = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleDateString('id-ID', { month: 'short' });
    monthLabels.push(monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1, 3));
    monthNumbers.push(d.getMonth() + 1);
  }
  
  // Query to get view counts grouped by published month
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
  
  console.log("[getArticleViewsByMonth] Query result:", result);
  console.log("[getArticleViewsByMonth] Month labels:", monthLabels);
  
  // Map results to month labels
  const viewsByMonth = new Map();
  result.forEach((row: any) => {
    viewsByMonth.set(parseInt(row.month_num), parseInt(row.total_views) || 0);
  });
  
  // Build final data array
  const currentMonth = now.getMonth() + 1;
  const data: Array<{ month: string; views: number }> = [];
  
  for (let i = 0; i < months; i++) {
    const monthIndex = ((currentMonth - months + i + 1 + 12) % 12) || 12;
    const label = monthLabels[i];
    const views = viewsByMonth.get(monthIndex) || 0;
    data.push({ month: label, views });
  }
  
  console.log("[getArticleViewsByMonth] Final data:", data);
  
  return data;
}

/**
 * Create a table to track individual article views over time
 * Call this function to set up the table (run once during migration)
 */
export async function setupArticleViewsTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS article_views (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      viewer_ip TEXT,
      viewer_user_id UUID REFERENCES users(id) ON DELETE SET NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
    CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON article_views(viewed_at);
  `;
}

/**
 * Record a view for an article (for future tracking)
 */
export async function recordArticleView(
  articleId: string,
  viewerIp?: string,
  viewerUserId?: string
): Promise<void> {
  await sql`
    INSERT INTO article_views (article_id, viewed_at, viewer_ip, viewer_user_id)
    VALUES (${articleId}, NOW(), ${viewerIp ?? null}, ${viewerUserId ?? null})
  `;
}

/**
 * Get real-time article views aggregated by month (requires article_views table)
 */
export async function getArticleViewsByMonthRealTime(months: number = 6): Promise<Array<{ month: string; views: number }>> {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  
  const result = await sql`
    SELECT 
      TO_CHAR(viewed_at, 'Mon') as month_label,
      EXTRACT(MONTH FROM viewed_at) as month_num,
      COUNT(*) as view_count
    FROM article_views
    WHERE viewed_at >= ${startDate.toISOString()}
    GROUP BY TO_CHAR(viewed_at, 'Mon'), EXTRACT(MONTH FROM viewed_at)
    ORDER BY EXTRACT(MONTH FROM viewed_at) ASC
  `;
  
  // Build month labels
  const monthLabels: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('id-ID', { month: 'short' });
    monthLabels.push(label.charAt(0).toUpperCase() + label.slice(1, 3));
  }
  
  // Map results
  const viewsByMonth = new Map();
  result.forEach((row: any) => {
    viewsByMonth.set(parseInt(row.month_num), parseInt(row.view_count));
  });
  
  // Build final data
  const data: Array<{ month: string; views: number }> = [];
  for (let i = 0; i < months; i++) {
    data.push({
      month: monthLabels[i],
      views: viewsByMonth.get(((now.getMonth() + 2 - months + i + 12) % 12) || 12) || 0
    });
  }
  
  return data;
}
