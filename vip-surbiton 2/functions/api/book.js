import { wrap } from "../../lib/cf-adapter.js";
import handler from "../../api/book.js";
export const onRequest = wrap(handler);
