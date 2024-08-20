import {it, expect} from "bun:test"
import { getBookByIsbn } from "../src"
it("can get book by isbn 1931498717",async ()=>{
  const res =await getBookByIsbn('1931498717');
  expect(res).toEqual(expect.objectContaining({
    title:"Don't Think of an Elephant!",
    cover_url: expect.any(String)
  }))
})
