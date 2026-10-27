import { wrap } from "../../lib/cf-adapter.js";
import handler from "../../api/orders.js";
export const onRequest = wrap(handler);
