import { Choice } from "@story-machines/choices";
import { Context, Input, StoryMachineStatus } from "@story-machines/core";
import React from "react";

interface InputControlsProps {
  storyStatus?: StoryMachineStatus;
  choices?: Choice[];
  tick?: (input?: Input) => {};
}

export function InputControls({
  choices,
  tick,
  storyStatus,
}: InputControlsProps) {
  if (storyStatus === "Completed" || storyStatus === "Terminated") {
    return null;
  }
  if (!choices) {
    return (
      <ul>
        <li>
          <button onClick={() => tick?.()}>Continue</button>
        </li>
      </ul>
    );
  }
  return (
    <ul>
      {choices?.map((choice) => (
        <li key={choice.id}>
          <button
            onClick={() =>
              tick?.({ type: "Choice", payload: { id: choice.id } })
            }
          >
            {choice.text}
          </button>
        </li>
      ))}
    </ul>
  );
}
