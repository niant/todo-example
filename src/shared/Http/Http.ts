import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { taskEither } from "fp-ts";
import * as T from "io-ts";
import { pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/lib/TaskEither";

export const toTaskEither = <T>(f: () => Promise<T>) =>
  taskEither.tryCatch(f, (e) => e as Error);

const decodeWith =
  <A>(codec: T.Type<A>) =>
  (responseData: A) =>
    pipe(codec.decode(responseData), taskEither.fromEither);

const decodeResponseWith =
  <A>(codec: T.Type<A>) =>
  <E>(response: TaskEither<E, AxiosResponse<any>>) =>
    pipe(
      response,
      taskEither.map((response) => response.data),
      taskEither.chainW(decodeWith(codec))
    );

export const post = <Response, T extends Object = Object>(
  url: string,
  data: T
) => toTaskEither(() => axios.post<Response>(url, data));

export const postV = <A, O extends Object = Object>(
  codec: T.Type<A>,
  url: string,
  data: O
) => pipe(post<A>(url, data), decodeResponseWith(codec));

export const get = <Response>(url: string, config?: AxiosRequestConfig) =>
  toTaskEither(() => axios.get<Response>(url, config));

export const getV = <A>(
  codec: T.Type<A>,
  url: string,
  config?: AxiosRequestConfig
) => pipe(get<A>(url, config), decodeResponseWith(codec));

export const remove = <Response>(url: string, config?: AxiosRequestConfig) =>
  toTaskEither(() => axios.delete<Response>(url, config));

export const removeV = <A>(
  codec: T.Type<A>,
  url: string,
  config?: AxiosRequestConfig
) => pipe(remove<A>(url, config), decodeResponseWith(codec));

export const put = <Response, T extends Object = Object>(
  url: string,
  data: T
) => toTaskEither(() => axios.put<Response>(url, data));

export const putV = <A, O extends Object = Object>(
  codec: T.Type<A>,
  url: string,
  data: O
) => pipe(put<A>(url, data), decodeResponseWith(codec));
