import { BookNotFound } from "../exception/BookNotFound";
import type { Book } from "../type";
import { BaseCrawler } from "./base";

interface GoogleBookData {
  kind: string;
  totalItems: number;
  items: {
    selfLink: string;
  }[];
}

export type GoogleBookItem = {
  kind: string;
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: {
    title: string;
    authors: Array<string>;
    publisher: string;
    publishedDate: string;
    description: string;
    industryIdentifiers: Array<{
      type: string;
      identifier: string;
    }>;
    readingModes: {
      text: boolean;
      image: boolean;
    };
    pageCount: number;
    printedPageCount: number;
    dimensions: {
      height: string;
    };
    printType: string;
    averageRating: number;
    ratingsCount: number;
    maturityRating: string;
    allowAnonLogging: boolean;
    contentVersion: string;
    panelizationSummary: {
      containsEpubBubbles: boolean;
      containsImageBubbles: boolean;
    };
    imageLinks: {
      smallThumbnail: string;
      thumbnail: string;
      small: string;
      medium: string;
      large: string;
      extraLarge: string;
    };
    language: string;
    previewLink: string;
    infoLink: string;
    canonicalVolumeLink: string;
  };
  saleInfo: {
    country: string;
    saleability: string;
    isEbook: boolean;
  };
  accessInfo: {
    country: string;
    viewability: string;
    embeddable: boolean;
    publicDomain: boolean;
    textToSpeechPermission: string;
    epub: {
      isAvailable: boolean;
    };
    pdf: {
      isAvailable: boolean;
    };
    webReaderLink: string;
    accessViewStatus: string;
    quoteSharingAllowed: boolean;
  };
};

export class Google extends BaseCrawler {
  constructor(signal: AbortSignal, key?: string) {
    super(signal, key);
    if (!key) {
      throw new Error("Google API key is required");
    }
  }
  async getBookByIsbn(isbn: string): Promise<Book> {
    const data: GoogleBookData = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${this.key}`,
      {
        signal: this.signal,
      },
    ).then((res) => res.json());

    if (data.totalItems === 0) {
      throw new BookNotFound();
    }
    let item: GoogleBookItem = data.items[0] as GoogleBookItem;
    const selfLink = data.items[0].selfLink;

    await fetch(selfLink, {
      signal: this.signal,
    })
      .then(async (res) => {
        const json = (await res.json()) as any;
        if (!("error" in json)) {
          item = json as GoogleBookItem;
        }
      })
      .catch(() => {
        //
      });
    if (!item) {
      throw new BookNotFound();
    }

    return {
      title: item.volumeInfo.title,
      ...(item.volumeInfo.imageLinks && {
        cover: {
          small:
            item.volumeInfo.imageLinks?.small ||
            item.volumeInfo.imageLinks?.smallThumbnail,
          medium:
            item.volumeInfo.imageLinks?.medium ||
            item.volumeInfo.imageLinks?.thumbnail,
          large:
            item.volumeInfo.imageLinks?.large ||
            item.volumeInfo.imageLinks?.thumbnail,
        },
      }),
      authors: item.volumeInfo.authors,
      publishers: [item.volumeInfo.publisher],
      publish_date: item.volumeInfo.publishedDate,
      number_of_pages: item.volumeInfo.pageCount,
      description: item.volumeInfo.description,
    };
  }
}
