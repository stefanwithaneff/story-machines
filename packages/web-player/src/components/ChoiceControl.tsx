import { Choice, ChoiceInput } from "@story-machines/choices";
import { Input } from "@story-machines/core";
import { useCallback } from "react";
import { css } from "@emotion/css";

interface ChoiceControlProps {
  choice?: Choice;
  tick: (input?: Input) => void;
}

export function ChoiceControl({ choice, tick }: ChoiceControlProps) {
  const handleClick = useCallback(() => {
    if (!choice) {
      tick();
      return;
    }

    const input: ChoiceInput = {
      type: "Choice",
      payload: {
        id: choice.id,
      },
    };
    tick(input);
  }, [choice?.id, tick]);

  return (
    <button
      className={css`
        display: block;
        width: 100%;
        margin: 0;
        padding: 0.5rem;
        :hover {
          cursor: pointer;
        }
      `}
      onClick={handleClick}
    >
      {choice?.text ?? "Continue"}
    </button>
  );
}
