import { getSqliteBinding } from "./sqlite.mjs";

// Next.js resolves the existing Worker imports here on the Hostinger build.
export const env = {
  ...process.env,
  get DB() { return getSqliteBinding(); },
  BUCKET: undefined,
};
