import { Pool, QueryResult } from "pg";
import { taskEither } from "fp-ts";
import * as R from "ramda";

export const toTaskEither = <T, E = Error>(f: () => Promise<T>) =>
  taskEither.tryCatch(f, (e) => e as E);

const query =
  (pool: Pool) =>
  <Result, T extends unknown[] = unknown[], E = string>(
    text: string,
    params?: T
  ) => {
    return toTaskEither<QueryResult<Result>, E>(() =>
      pool.query<Result, T>(text, params)
    );
  };

export type Db = {
  query: <Result, T extends unknown[] = unknown[], E = Error>(
    text: string,
    params?: T
  ) => taskEither.TaskEither<E, QueryResult<Result>>;
};

export const dbInstance = (): Db => {
  const pool = new Pool();

  return {
    query: query(pool),
  };
};

export const updateSql = <
  T extends Record<string, any>,
  C extends Record<string, any>
>(
  table: string,
  data: T,
  conditions: C
) => {
  const keys = R.keys(data);
  const mapIndexed = R.addIndex(R.map);
  const keyCount = keys.length;
  const conditionKeys = R.keys(conditions);

  const sqlSet = mapIndexed((key, i) => `${key} = $${i + 1}`, keys);
  const sqlSetStr = R.join(", ", sqlSet);

  const sqlConditions = mapIndexed(
    (key, i) => `${key} = $${i + 1 + keyCount}`,
    conditionKeys
  );
  const sqlConditionsStr = R.join(" AND ", sqlConditions);

  const sql = `UPDATE ${table} SET ${sqlSetStr} WHERE ${sqlConditionsStr} RETURNING *`;

  const values = R.concat(R.values(data), R.values(conditions));

  return { sql, values };
};
