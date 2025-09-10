# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for development
- `npm run prod` - Production build with feed and sitemap generation

### Content Management
- `npm run gen-feed` - Generate RSS feeds (feed.xml and feed-internal.xml)
- `npm run gen-sitemap` - Generate sitemap
- `npm run import` - Import Bear notes using the bear_note_importer script
- `npm run push-entries` - Commit and push new posts to both posts and images repositories
- `npm run pull-entries` - Pull latest posts and images from repositories

### Scripts
- `npm run init-ci` - Initialize CI environment by cloning posts and images repositories
- `npm run release` - Trigger GitHub release workflow
- `npm run release-watch` - Trigger release and watch the workflow

## Architecture Overview

This is a Next.js static blog that supports both Markdown and Org-mode content:

### Content Management System
- **Posts**: Stored in separate git repository (`posts/` directory is a git submodule)
- **Images**: Stored in separate git repository (`public/images/` is a git submodule)
- **Entry Processing**: The `Entry` class in `src/entities/Entry.ts` handles both `.md` and `.org` files
- **Content Types**: Supports normal posts, Hatena blog imports, and Qiita imports

### Key Files
- `src/entities/Entry.ts` - Core content processing logic for both Markdown and Org-mode
- `scripts/feed.ts` - RSS feed generation
- `scripts/sitemap.ts` - Sitemap generation
- `scripts/bear_note_importer.ts` - Import notes from Bear app

### Build Process
- Uses Next.js static export (`output: 'export'`) for production
- Generates RSS feeds and sitemap during production build
- Content is pulled from external repositories during CI

### Environment Variables
- `NEXT_PUBLIC_SITE_NAME` - Site name for RSS feeds
- `NEXT_PUBLIC_SITE_DOMAIN` - Site domain
- `NEXT_PUBLIC_SITE_AUTHOR` - Author name for RSS feeds
- `INCLUDE_DRAFT` - Set to '1' to include draft posts
- `GH_TOKEN` - GitHub token for CI repository cloning

## Content Structure

- Posts support both Markdown (.md) and Org-mode (.org) formats
- Categories are used for tagging, with 'share' and 'blog' categories hidden from display
- External posts (Hatena, Qiita) are detected automatically based on metadata
- Draft posts can be excluded unless `INCLUDE_DRAFT=1` is set

