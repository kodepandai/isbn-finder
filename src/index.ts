import { Google } from "./crawler/google";
import { OpenLibrary } from "./crawler/openlibrary";
import { Sdia35 } from "./crawler/sdia35";
import { InvalidISBN } from "./exception/InvalidISBN";

const allCrawlers = {
  google: Google,
  openlib: OpenLibrary,
  sdia35: Sdia35,
};
export type CrawlerOptions = {
  returnMultiple?: boolean;
} & Partial<
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
    key: undefined as string | undefined,
  },
  openlib: {
    enabled: true,
  },
  sdia35: {
    enabled: true,
  },
};

import type { Book } from "./type";

type CrawlerResponse = Book & {
  crawler: keyof typeof allCrawlers;
};

export function resolve(
  isbn: string,
  options: CrawlerOptions & { returnMultiple: true },
): Promise<CrawlerResponse[]>;
export function resolve(
  isbn: string,
  options?: CrawlerOptions & { returnMultiple?: false },
): Promise<CrawlerResponse | undefined>;
export async function resolve(
  isbn: string,
  options: CrawlerOptions = {},
): Promise<CrawlerResponse | CrawlerResponse[] | undefined> {
  if (!isValidIsbn(isbn)) {
    throw new InvalidISBN();
  }

  const { returnMultiple, ...configuredCrawlers } = options;
  const crawlers = {
    ...defaultCrawlers,
    ...configuredCrawlers,
  } as CrawlerOptions;
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
        if (!returnMultiple) {
          Object.entries(controllers)
            .filter(([ckey]) => ckey !== key)
            .forEach(([_, x]) => {
              x.abort();
            });
        }
        return {
          ...res,
          crawler: key as keyof typeof allCrawlers,
        };
      }
    }),
  );

  const res = allRes
    .filter((res) => res.status === "fulfilled" && res.value !== undefined)
    .map((res) => (res as PromiseFulfilledResult<CrawlerResponse>).value);
  if (returnMultiple) {
    return res;
  }

  return res[0];
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
