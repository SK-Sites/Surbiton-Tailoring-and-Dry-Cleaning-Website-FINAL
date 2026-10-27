import { wrap } from "../../lib/cf-adapter.js";
import handler from "../../api/catalog.js";
export const onRequest = wrap(handler);
