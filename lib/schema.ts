import { pgTable, uuid, text, integer, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core'

export const categories = pgTable('categories', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        text('name').unique().notNull(),
  slug:        text('slug').unique().notNull(),
  description: text('description'),
  color:       text('color').default('#7C3AED'),
  order:       integer('order').default(0),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type Category = typeof categories.$inferSelect

export const articles = pgTable('articles', {
  id:          uuid('id').primaryKey().defaultRandom(),
  title:       text('title').notNull(),
  slug:        text('slug').unique().notNull(),
  excerpt:     text('excerpt'),
  content:     text('content'),  // markdown
  coverImage:  text('cover_image'),
  category:    text('category'),
  tags:        text('tags').array(),
  status:      text('status').default('draft'),   // draft | review | published
  // GEO fields
  aiSummaryQ:  text('ai_summary_q'),   // Question for AI summary box
  aiSummaryA:  text('ai_summary_a'),   // Answer for AI summary box
  keyPoints:   text('key_points').array(),
  faqJson:     jsonb('faq_json'),      // [{q: string, a: string}]
  schemaJson:  jsonb('schema_json'),
  geoScore:    integer('geo_score').default(0),
  readTime:    integer('read_time').default(5),
  featured:    boolean('featured').default(false),
  // LINE Broadcast
  // Scheduling
  publishScheduledAt: timestamp('publish_scheduled_at', { withTimezone: true }),
  // LINE Broadcast
  lineBroadcastMsg:  text('line_broadcast_msg'),
  lineBroadcastSent: boolean('line_broadcast_sent').default(false),
  lineBroadcastAt:   timestamp('line_broadcast_at', { withTimezone: true }),
  // Social publish status
  fbSent:   boolean('fb_sent').default(false),
  fbSentAt: timestamp('fb_sent_at', { withTimezone: true }),
  ttSent:   boolean('tt_sent').default(false),
  ttSentAt: timestamp('tt_sent_at', { withTimezone: true }),
  igSent:   boolean('ig_sent').default(false),
  igSentAt: timestamp('ig_sent_at', { withTimezone: true }),
  // Social Media
  fbCaption:    text('fb_caption'),      // Facebook post (up to ~63k chars, ~500 ideal)
  fbHashtags:   text('fb_hashtags'),     // e.g. "#SME #ธุรกิจ"
  ttCaption:    text('tt_caption'),      // TikTok caption (max 2,200 chars, ~150 ideal)
  ttHashtags:   text('tt_hashtags'),     // TikTok hashtags
  ttVideoUrl:   text('tt_video_url'),    // TikTok video URL (required for auto-post)
  igCaption:    text('ig_caption'),      // Instagram caption (max 2,200 chars)
  igHashtags:   text('ig_hashtags'),     // Instagram hashtags (up to 30)
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const settings = pgTable('settings', {
  key:       text('key').primaryKey(),
  value:     text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const subscribers = pgTable('subscribers', {
  id:          uuid('id').primaryKey().defaultRandom(),
  email:       text('email').unique(),
  status:      text('status').default('pending'),
  source:      text('source').default('newsletter'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type Article = typeof articles.$inferSelect
export type NewArticle = typeof articles.$inferInsert
