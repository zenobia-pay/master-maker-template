import * as authSchema from "./auth.schema";
import * as d1Schema from "./d1.schema";

export const schema = {
  ...authSchema,
  ...d1Schema,
} as const;
