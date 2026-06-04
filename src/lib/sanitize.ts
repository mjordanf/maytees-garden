export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/\0/g, '')
    .replace(/<[^>]*>/g, '')
    .slice(0, 1000)
}

export function sanitizeRichText(input: string): string {
  return input
    .trim()
    .replace(/\0/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=/gi, ' data-removed=')
    .replace(/javascript:/gi, '')
    .slice(0, 5000)
}
