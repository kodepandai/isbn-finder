import { OpenLibrary } from "./crawler/openlibrary";
import { Sdia35 } from "./crawler/sdia35";

export async function getBookByIsbn(isbn: string, debug = false) {
  const crawlers = [OpenLibrary,Sdia35];
  Promise.race
  const allRes = await Promise.allSettled(
    crawlers.map((c) => new c().getBookByIsbn(isbn)),
  );
  if(debug && allRes.findIndex(x=>x.status == "fulfilled") == -1){
    console.log(allRes.filter((res) => res.status === "rejected"));
  }
  return allRes.find((res) => res.status === "fulfilled")?.value;
}
