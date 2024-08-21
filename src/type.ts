export interface Book {
  title: string;
  cover: {
    small?: string;
    medium?: string;
    large?: string;
  }
  authors: string[];
  publishers: string[];
  publish_date: string;
  number_of_pages?: number;
  description: string;
}
export interface Crawler {
  getBookByIsbn: (isbn: string) => Promise<Book>;
}
