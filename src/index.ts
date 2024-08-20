import { OpenLibrary } from "./crawler/openlibrary";

export async function getBookByIsbn(isbn: string){
  const crawlers = [OpenLibrary]
  const allRes = await Promise.allSettled(crawlers.map(c=>new c().getBookByIsbn(isbn)))
  return allRes.find(res=>res.status==='fulfilled')?.value
}
