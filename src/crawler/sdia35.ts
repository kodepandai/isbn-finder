import { BookNotFound } from "../exception/BookNotFound";
import type { Book, Crawler } from "../type";

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

export class Sdia35 implements Crawler {
  async getBookByIsbn(isbn: string): Promise<Book> {
    const data:Sdia35Res = await fetch(`https://library.sdia35.sch.id/index.php?JSONLD=true&isbn=${isbn}&search=search`).then(res=>res.json())
    if(!data?.["@graph"] || data?.["@graph"].findIndex(x=>x.isbn==isbn)==-1){
      throw new BookNotFound
    }
    const detail = data["@graph"][0];
    return {
      title: detail.name,
      cover: {
        small: this.coverUrl(detail.image,100),
        medium: this.coverUrl(detail.image,200),
        large: this.coverUrl(detail.image,300),
      },
      authors: detail.author.name,
      publishers: [detail.publisher],
      publish_date: detail.dateCreated,
      number_of_pages: undefined,
      description: undefined,
    }
  }
  private coverUrl(path: string, size:number){
    return `https://library.sdia35.sch.id/lib/minigalnano/createthumb.php?filename=images%2Fdocs%2F${path}&width=${size}`
  }
}
