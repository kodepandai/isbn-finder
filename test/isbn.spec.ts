import { describe, expect, it } from "bun:test";
import { resolve } from "../src";
import { InvalidISBN } from "../src/exception/InvalidISBN";

describe("get book by isbn", () => {
  [
    {
      isbn: "1931498717",
      title: "Don't Think of an Elephant!",
      isValid: true,
    },
    {
      isbn: "9781443415750",
      title: "The Rainbow Troops",
      isValid: true,
    },
    {
      isbn: "9780140328721",
      title: "Fantastic Mr. Fox",
      isValid: true,
    },
    {
      isbn: "9786239869304",
      title: "Cerita islam pertamaku : Nabi Muhammad  SAW",
      isValid: true,
    },
    {
      isbn: "9789793062792",
      title: "Laskar Pelangi",
      isValid: true,
    },
    {
      isbn: "9781784408305",
      title: "rescue vehicles",
      isValid: true,
    },
    {
      isbn: "9789790636705",
      title: "Nabi ilyas as.",
      isValid: true,
    },
    {
      isbn: "1234567890",
      title: "Invalid ISBN",
      isValid: false,
    },
  ].forEach(({ isbn, title, isValid }) => {
    it(`can get detail book of isbn ${isbn}`, async () => {
      const resolver = resolve(isbn, {
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
      });
      if (!isValid) {
        expect(resolver).rejects.toThrow(InvalidISBN);
      } else {
        const res = await resolver;
        if (res?.cover) {
          expect(res.cover).toEqual(
            expect.objectContaining({
              small: expect.any(String),
              medium: expect.any(String),
              large: expect.any(String),
            }),
          );
        }
        if (res?.number_of_pages) {
          expect(res.number_of_pages).toEqual(expect.any(Number));
        }
        if (res?.description) {
          expect(res.description).toEqual(expect.any(String));
        }
        if (res?.title) {
          res.title = res.title.toLowerCase();
        }
        expect(res).toEqual(
          expect.objectContaining({
            title: title.toLowerCase(),
            authors: expect.arrayContaining([]),
            publishers: expect.arrayContaining([]),
            publish_date: expect.any(String),
          }),
        );
      }
    });

    it(`can get multiple results for isbn when returnMultiple is true`, async () => {
      const resolver = resolve(isbn, {
        returnMultiple: true,
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
      });
      const res = await resolver;
      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBeGreaterThan(0);
      expect(res[0].title).toBeDefined();
    });
  });
});
