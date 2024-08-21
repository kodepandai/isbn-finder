import { BookNotFound } from "../exception/BookNotFound";
import type { Book, Crawler } from "../type";
interface OpenLibraryBookData {
  url: string;
  key: string;
  title: string;
  authors: { url: string; name: string }[];
  identifiers: Record<"isbn_10" | "lccn" | "oclc" | "openlibrary", string[]>;
  classifications: Record<"lc_classifications", string[]>;
  subjects: { name: string; url: string }[];
  subject_places: { name: string; url: string }[];
  subject_times: { name: string; url: string }[];
  ebooks: {
    preview_url: string;
    availability: string;
    formats: {};
    borrow_url: string;
    checkedout: boolean;
  }[];
  publishers: { name: string }[];
  publish_date: string;
  cover: {
    small: string;
    medium: string;
    large: string;
  };
  number_of_pages: number;
}
interface OpenLibraryBookDetail {
  details: {
    description: {
      type: string;
      value: string;
    };
  };
}

type OpenLibraryBookDataRes = Record<string, OpenLibraryBookData>;
type OpenLibraryBookDetailRes = Record<string, OpenLibraryBookDetail>;
export class OpenLibrary implements Crawler {
  async getBookByIsbn(isbn: string): Promise<Book> {
    const data = await this.getData(isbn);
    const detail = await this.getDetail(isbn);
    return {
      title: data.title,
      cover: data.cover,
      authors: data.authors.map((a) => a.name),
      publishers: data.publishers.map((p) => p.name),
      publish_date: data.publish_date,
      number_of_pages: data.number_of_pages,
      description: detail.details.description.value,
    };
  }

  private async getData(isbn: string) {
    const bookData: OpenLibraryBookDataRes = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
    ).then((res) => res.json());
    if (Object.keys(bookData).length === 0) {
      throw new BookNotFound();
    }
    return Object.values(bookData)[0];
  }

  private async getDetail(isbn: string) {
    const bookDetail: OpenLibraryBookDetailRes = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=details`,
    ).then((res) => res.json());
    if (Object.keys(bookDetail).length == 0) {
      throw new BookNotFound();
    }
    return Object.values(bookDetail)[0];
  }
}
