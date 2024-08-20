export interface Book {
  title: string;
  cover_url: string;
}
export interface Crawler {
  getBookByIsbn: (isbn: string) => Promise<Book>;
}
