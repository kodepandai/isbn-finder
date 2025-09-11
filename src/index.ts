import { Google } from "./crawler/google";
import { OpenLibrary } from "./crawler/openlibrary";
import { Sdia35 } from "./crawler/sdia35";
import { InvalidISBN } from "./exception/InvalidISBN";

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
  if (!isValidIsbn(isbn)) {
    throw new InvalidISBN();
  }
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

const isValidIsbn10 = (isbn: string) => {
  // ISBN-10 format: 9 digits + check digit (0-9 or X)
  const isbn10Pattern = /^[0-9]{9}[\dX]$/;
  if (!isbn10Pattern.test(isbn)) {
    return false;
  }

  // Validate checksum
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i], 10) * (10 - i);
  }

  // Check digit can be 'X' which represents 10
  const lastChar = isbn[9];
  sum += lastChar === "X" ? 10 : parseInt(lastChar, 10);

  return sum % 11 === 0;
};

const isValidIsbn13 = (isbn: string) => {
  // ISBN-13 format: 13 digits
  const isbn13Pattern = /^[0-9]{13}$/;
  if (!isbn13Pattern.test(isbn)) {
    return false;
  }

  // Validate checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  const lastDigit = parseInt(isbn[12], 10);

  return checkDigit === lastDigit;
};

export function isValidIsbn(isbn: string) {
  return isValidIsbn10(isbn) || isValidIsbn13(isbn);
}
