import { FormEvent, useCallback, useState } from "react";

type SubmitInput = (input: string) => void;

export const TodoInput = ({
  submit,
  input: defaultInput = "",
  onBlur = () => {},
}: {
  submit: SubmitInput;
  input?: string;
  onBlur?: () => void;
}) => {
  const [input, setInput] = useState(defaultInput);

  // Memoized just for demo purposes, not necessarily smart choice here
  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      submit(input);
      setInput("");
    },
    [input, submit, setInput]
  );

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        className="w-full p-4"
        autoFocus={true}
        placeholder="What needs to be done?"
        value={input}
        onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
          setInput(e.target.value)
        }
        onBlur={onBlur}
      />
    </form>
  );
};
