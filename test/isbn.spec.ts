import { it, expect, describe } from "bun:test";
import { resolve } from "../src";

describe("get book by isbn", () => {
  [
    {
      isbn: "1931498717",
      title: "Don't Think of an Elephant!",
    },
    {
      isbn: "9781443415750",
      title: "The Rainbow Troops",
    },
    {
      isbn: "9780140328721",
      title: "Fantastic Mr. Fox",
    },
    {
      isbn: "9786239869304",
      title: "Cerita islam pertamaku : Nabi Muhammad  SAW",
    },
    {
      isbn: "9789793062792",
      title: "Laskar Pelangi",
    },
    {
      isbn: "9781784408305",
      title: "rescue vehicles"
    }
  ].map(({ isbn, title }) => {
    it("can get detail book of isbn " + isbn, async () => {
      const res = await resolve(isbn);
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
    });
  });
});
