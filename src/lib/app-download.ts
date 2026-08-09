import { portfolioItems, type PortfolioItem } from './portfolio-data'

/** camelCase portfolio key → URL slug (e.g. skiGreece → ski-greece) */
export function slugFromPortfolioKey(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export interface AppDownloadPage extends PortfolioItem {
  slug: string
}

export function getAppDownloadPages(): AppDownloadPage[] {
  return portfolioItems
    .filter(
      (item) =>
        item.storeComingSoon ||
        item.storeLinks?.apple ||
        item.storeLinks?.android
    )
    .map((item) => ({ ...item, slug: slugFromPortfolioKey(item.key) }))
}

export function getAppDownloadPage(slug: string): AppDownloadPage | undefined {
  return getAppDownloadPages().find((item) => item.slug === slug)
}
