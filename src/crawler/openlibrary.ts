import type { Book, Crawler } from "../type";
interface OpenLibraryBookDetail {
  works: { key: string }[];
  title: string;
  publishers: string[];
  publish_date: string;
  key: string;
  type: { key: string };
  isbn_10: string[];
  ocaid: string;
  languages: { key: string }[];
  covers: number[];
  local_id: string[];
  lccn: string[];
  lc_classifications: string[];
  oclc_numbers: string[];
  source_records: string[];
  number_of_pages: number;
  description: {
    type: "/type/text";
    value: string;
  };
  latest_revision: number;
  revision: number;
  created: {
    type: "/type/datetime";
    vaue: string;
  };
  last_modified: {
    type: "/type/datetime";
    value: string;
  };
}
export class OpenLibrary implements Crawler {
  async getBookByIsbn(isbn: string): Promise<Book> {
    const bookDetail:OpenLibraryBookDetail = await fetch(`https://openlibrary.org/isbn/${isbn}.json`).then((res) =>
      res.json(),
    );
    return {
      title: bookDetail.title,
      cover_url: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
    }
  }
}
