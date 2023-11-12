import { is } from "ramda";

export const isDefined = <T>(x: T | undefined): x is T => x !== undefined;

export const run = <A, B>(param: A, f: (x: A) => B) => f(param);

export const allStrings = <T>(arr: (T | string)[]): arr is string[] =>
  arr.every((x) => is(String, x));
