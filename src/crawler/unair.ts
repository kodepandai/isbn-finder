import { BookNotFound } from "../exception/BookNotFound";
import type { Book } from "../type";
import { BaseCrawler } from "./base";

interface UnairRes {
  documents: {
    isbn: string,
    title: string;
    authors: { fullname: string }[]
    publishers: string[];
    publication_date: string;
    thumbnail_small: string;
    thumbnail_medium: string;
    thumbnail_large: string;
  }[]
}
export class Unair extends BaseCrawler {
  async getBookByIsbn(isbn: string): Promise<Book> {
    const res: UnairRes = await fetch(`https://unair.summon.serialssolutions.com/api/search?q=(Isbn%3A(${isbn}))`, {
      signal: this.signal
    }).then(res=>res.json());

    const detail = res.documents.find(x => x.isbn == isbn);
    if (!detail) {
      throw new BookNotFound();
    }
    return {
      title: detail.title,
      authors: detail.authors.map(a=>a.fullname),
      publishers: detail.publishers,
      publish_date: detail.publication_date,
      cover: {
        small: detail.thumbnail_small,
        medium: detail.thumbnail_medium,
        large: detail.thumbnail_large,
      },
    }
  }
}
