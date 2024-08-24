import { BookNotFound } from "../exception/BookNotFound";
import type { Book } from "../type";
import { BaseCrawler } from "./base";

interface Sdia35Res {
  "@graph": {
    "@id": string;
    name: string;
    author: {
      name: string[]
    };
    publisher: string;
    dateCreated: string;
    image: string;
    isbn: string;
  }[];
}

export class Sdia35 extends BaseCrawler {
  async getBookByIsbn(isbn: string): Promise<Book> {
    const data: Sdia35Res = await fetch(`https://library.sdia35.sch.id/index.php?JSONLD=true&isbn=${isbn}&search=search`, {
      signal: this.signal
    }).then(res => res.json());

    const detail = data?.["@graph"]?.find(x => x.isbn == isbn);
    if (!detail) {
      throw new BookNotFound
    }
    return {
      title: detail.name,
      cover: {
        small: this.coverUrl(detail.image, 100),
        medium: this.coverUrl(detail.image, 200),
        large: this.coverUrl(detail.image, 300),
      },
      authors: detail.author.name,
      publishers: [detail.publisher],
      publish_date: detail.dateCreated,
      number_of_pages: undefined,
      description: undefined,
    }
  }
  private coverUrl(path: string, size: number) {
    return `https://library.sdia35.sch.id/lib/minigalnano/createthumb.php?filename=images%2Fdocs%2F${path}&width=${size}`
  }
}
