import * as R from "ramda";

export const updateWith = <T>(
  compareFn: (item: T) => boolean,
  items: T[],
  item: T
) => R.map(R.when(compareFn, R.always(item)))(items);
