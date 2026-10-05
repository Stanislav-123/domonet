import { customAlphabet } from "nanoid";

export const makeLinkCode = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  8,
);

export const makeClickId = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyz",
  16,
);
