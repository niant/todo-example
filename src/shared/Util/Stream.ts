import { getOrElseW } from "fp-ts/lib/Either";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { from, map, defer, Subject } from "rxjs";

// https://stackoverflow.com/questions/43199642/how-to-throw-error-from-rxjs-map-operator-angular
export const fromTaskEither = <E, A>(taskEither: TaskEither<E, A>) =>
  defer(() => from(taskEither())).pipe(
    map(
      getOrElseW((e: E) => {
        throw e;
      })
    )
  );

// https://stackoverflow.com/questions/44783102/rxjs-correct-way-to-manually-emit-an-observable
export const subject = <A>() => {
  const sub$ = new Subject<A>();
  const set_X = (value: A) => sub$.next(value);

  return [sub$, set_X] as const;
};
