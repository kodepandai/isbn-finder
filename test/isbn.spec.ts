import { it, expect } from "bun:test";
import { getBookByIsbn } from "../src";
[
  {
    isbn: "1931498717",
    title: "Don't Think of an Elephant!",
  },
].map(({ isbn, title }) => {
  it("can get book by isbn " + isbn, async () => {
    const res = await getBookByIsbn(isbn);
    expect(res).toEqual(
      expect.objectContaining({
        title,
        cover: expect.objectContaining({
          small: expect.any(String),
          medium: expect.any(String),
          large: expect.any(String),
        }),
        authors: expect.arrayContaining([expect.any(String)]),
        publishers: expect.arrayContaining([expect.any(String)]),
        publish_date: expect.any(String),
        description: expect.any(String),
        number_of_pages: expect.any(Number),
      }),
    );
  });
});
