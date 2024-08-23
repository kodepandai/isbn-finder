import { OpenLibrary } from "./crawler/openlibrary";
import { Sdia35 } from "./crawler/sdia35";

const allCrawlers = {
  openlib: OpenLibrary,
  sdia35: Sdia35,
}

export async function resolve(isbn: string, crawlerIds: (keyof typeof allCrawlers)[] = Object.keys(allCrawlers) as any[]) {
  const crawlers = Object.fromEntries(Object.entries(allCrawlers).filter(([key]) => crawlerIds.includes(key as any)));
  const controllers = Object.fromEntries(Object.entries(crawlers).map(([key]) => [key, new AbortController]));
  const allRes = await Promise.allSettled(
    Object.entries(crawlers).map(async ([key, c]) => {
      const res = await new c(controllers[key].signal).getBookByIsbn(isbn);
      if (res) {
        Object.entries(controllers).filter(([ckey]) => ckey != key).forEach(([_, x]) => x.abort());
        return res
      }
    })
  );
  return allRes.find((res) => res.status === "fulfilled")?.value;
}
