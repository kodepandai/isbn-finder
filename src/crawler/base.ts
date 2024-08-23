import type { Book, Crawler } from "../type";

export abstract class BaseCrawler implements Crawler{
  constructor(protected signal: AbortSignal){}
  abstract getBookByIsbn(isbn: string): Promise<Book>;
}
