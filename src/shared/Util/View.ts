import { pipe } from "fp-ts/lib/function";
import * as R from "ramda";
import React, { createElement, FunctionComponent } from "react";
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  skipWhile,
} from "rxjs";
import { isDefined } from "./functions";

/**
 * A way to connect view to a Observable (RxJS in this case)
 */
export const connectView = <
  State extends Record<string, unknown>,
  PropsAndState,
  Props = Omit<PropsAndState, keyof State>
>(
  component: FunctionComponent<PropsAndState>,
  connectState: (props$: Observable<Props>) => Observable<State>,
  mapStateToProps: (props: Props, state: State) => PropsAndState = R.mergeRight
): FunctionComponent<Props> => {
  class ConnectStreamToComponent extends React.Component<Props, State> {
    static displayName: string;
    private subscription: { unsubscribe: () => void };
    private props$: BehaviorSubject<Props>;

    constructor(props: Props) {
      super(props);
      this.subscription = { unsubscribe: () => {} };
      this.props$ = new BehaviorSubject(props);
    }

    componentDidMount() {
      const distinctProps$ = pipe(this.props$, distinctUntilChanged());

      const uniqueState$ = pipe(
        connectState(distinctProps$),
        skipWhile((state) => this.state === state)
      );

      this.subscription = uniqueState$.subscribe((state) => {
        this.setState(() => state);
      });
    }

    componentWillUnmount() {
      this.subscription.unsubscribe();
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
      if (this.props !== prevProps) {
        this.props$.next(this.props);
      }
    }

    render() {
      /**
       * Since streams can be unreadable synchronously, the initial state
       * could be undefined and thus not worth rendering. This means the
       * root component of the application can't rely on this component
       * since it would not render anything. Root component have to be wrapped
       * into a static component like <div></div> if nothing else.
       */
      if (R.isNil(this.state)) {
        return null;
      }

      const propsAndState = mapStateToProps(this.props || {}, this.state || {});

      //@ts-ignore
      return createElement(component, propsAndState);
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
      return !(nextProps === this.props && nextState === this.state);
    }
  }

  if (isDefined(component.name)) {
    /// eslint-disable-next-line functional/immutable-data
    ConnectStreamToComponent.displayName = component.name;
  }

  return ConnectStreamToComponent as unknown as FunctionComponent<Props>;
};
