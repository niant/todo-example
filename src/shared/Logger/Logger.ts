import { Errors } from "io-ts";
import { failure } from "io-ts/lib/PathReporter";

const error = (e: Error | Errors) => {
  if (e instanceof Error) {
    console.error(e);
    return;
  }
  console.error(failure(e), e);
};

export const logger = {
  error,
};
