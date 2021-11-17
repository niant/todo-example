import { pipe } from "fp-ts/lib/function";
import { createElement, FunctionComponent } from "react";
import { Observable, of, skipWhile, tap } from "rxjs";
import * as R from "ramda";
import React from "react";
import { isDefined } from "./functions";

export const connectStreamToComponent = <
  State extends Record<string, unknown>,
  PropsAndState,
  Props extends Omit<PropsAndState, keyof State>
>(
  component: FunctionComponent<PropsAndState>,
  state$: Observable<State>,
  mapStateToProps: (props: Props, state: State) => PropsAndState = R.mergeRight
) => {
  class ConnectStreamToComponent extends React.Component<Props, State> {
    static displayName: string;
    private subscription: { unsubscribe: () => void };

    constructor(props: Props) {
      super(props);
      this.subscription = { unsubscribe: () => {} };
    }

    componentDidMount() {
      const uniqueState$ = pipe(
        state$,
        skipWhile((state) => this.state === state),
        tap((state) => this.setState(() => state))
      );

      this.subscription = uniqueState$.subscribe();
    }

    componentWillUnmount() {
      this.subscription.unsubscribe();
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

  return ConnectStreamToComponent;
};

export const connectStreamToComponentAsStream = <
  State extends Record<string, unknown>,
  PropsAndState,
  Props extends Omit<PropsAndState, keyof State>
>(
  component: FunctionComponent<PropsAndState>,
  state$: Observable<State>,
  mapStateToProps: (props: Props, state: State) => PropsAndState = R.mergeRight
) => of(connectStreamToComponent(component, state$, mapStateToProps));
