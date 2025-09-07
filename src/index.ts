import { Google } from "./crawler/google";
import { OpenLibrary } from "./crawler/openlibrary";
import { Sdia35 } from "./crawler/sdia35";

const allCrawlers = {
  google: Google,
  openlib: OpenLibrary,
  sdia35: Sdia35,
};
type Crawlers = Partial<
  Record<
    keyof typeof allCrawlers,
    {
      enabled: boolean;
      key?: string;
    }
  >
>;

const defaultCrawlers = {
  google: {
    enabled: true,
    key: process.env.GOOGLE_API_KEY,
  },
  openlib: {
    enabled: true,
  },
  sdia35: {
    enabled: true,
  },
};
export async function resolve(isbn: string, configuredCrawlers: Crawlers) {
  const crawlers = { ...defaultCrawlers, ...configuredCrawlers } as Crawlers;
  const enabledCrawlers = Object.fromEntries(
    Object.entries(allCrawlers).filter(
      ([key]) => crawlers[key as keyof typeof allCrawlers]?.enabled,
    ),
  );
  const controllers = Object.fromEntries(
    Object.entries(enabledCrawlers).map(([key]) => [
      key,
      new AbortController(),
    ]),
  );
  const crawlerInstances = Object.fromEntries(
    Object.entries(enabledCrawlers).map(([key, crawlerClass]) => [
      key,
      new crawlerClass(
        controllers[key].signal,
        crawlers[key as keyof typeof allCrawlers]?.key,
      ),
    ]),
  );
  const allRes = await Promise.allSettled(
    Object.entries(crawlerInstances).map(async ([key, c]) => {
      const res = await c.getBookByIsbn(isbn);
      if (res) {
        Object.entries(controllers)
          .filter(([ckey]) => ckey !== key)
          .forEach(([_, x]) => {
            x.abort();
          });
        return res;
      }
    }),
  );
  return allRes.find((res) => res.status === "fulfilled")?.value;
}
