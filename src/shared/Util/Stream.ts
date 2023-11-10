import { getOrElseW } from "fp-ts/lib/Either";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { BehaviorSubject, defer, from, map, Observable, Subject } from "rxjs";

// https://stackoverflow.com/questions/43199642/how-to-throw-error-from-rxjs-map-operator-angular
export const fromTaskEither = <E, A>(taskEither: TaskEither<E, A>) =>
  defer(() => from(taskEither())).pipe(
    map(
      getOrElseW((e: E) => {
        throw e;
      })
    )
  );

/**
 * Create a reactive adapter for React views, to use with component's imperative
 * methods like "onClick, onChange, onSubmit, onHover...". It mimics the API of
 * useState hook (tuple of value and setter are returned). Initial value
 * is optional.
 *
 * @example const [value$, setValue] = useObservableAdapter<T>(initialValue)
 * @notice Setters should *ONLY* be used in React views (or cyclic dependency).
 */
export const createReactiveAdapter = <A>(initialValue?: A) => {
  if (initialValue !== undefined) {
    return behavior<A>(initialValue);
  }
  return subject<A>();
};

/**
 * Create a reactive adapter for React views, to use component's imperative
 * methods like "onClick, onChange, onSubmit, onHover...". It mimics the API of
 * useState hook (tuple of value and setter are returned).
 *
 * @example const [value$, setValue] = subject<T>()
 * @notice Setters should ONLY be used in React views (or cyclic dependency).
 * @notice Setters should not be used in the state functions!
 */
export const subject = <A>() => {
  const sub$ = new Subject<A>();
  const set_X = (value: A) => sub$.next(value);

  return [sub$ as Observable<A>, set_X] as const;
};

/**
 * Create a reactive adapter for React views, to use component's imperative
 * methods like "onClick, onChange, onSubmit, onHover...". It mimics the API of
 * useState hook (tuple of value and setter are returned). It has initial value
 *
 * @example const [value$, setValue] = behavior<T>(initialValue)
 * @notice Setters should ONLY be used in React views (or cyclic dependency).
 * @notice Setters should not be used in the state functions!
 * @notice Use `subject` if no initial value is needed!
 */
export const behavior = <A>(initialValue: A) => {
  const sub$ = new BehaviorSubject<A>(initialValue);
  const set_X = (value: A) => sub$.next(value);

  return [sub$ as Observable<A>, set_X] as const;
};
