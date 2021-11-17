import * as R from "ramda";

export const isDefined = R.complement(R.isNil);

export const run = <A, B>(param: A, f: (x: A) => B) => f(param);
