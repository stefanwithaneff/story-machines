import { Choice } from "@story-machines/choices";
import { Input, StoryMachineStatus } from "@story-machines/core";
import { RuntimeStatus } from "../state/use-story-loader";
import { ChoiceControl } from "./ChoiceControl";

interface InputControlsProps {
  loaderStatus: RuntimeStatus;
  storyStatus?: StoryMachineStatus;
  choices?: Choice[];
  tick: (input?: Input) => void;
}

export function InputControls({
  choices,
  tick,
  storyStatus,
  loaderStatus,
}: InputControlsProps) {
  if (
    storyStatus === "Completed" ||
    storyStatus === "Terminated" ||
    loaderStatus === "Error" ||
    loaderStatus === "Loading"
  ) {
    return null;
  }

  const choiceList =
    !choices || choices.length === 0 ? (
      <ChoiceControl tick={tick} />
    ) : (
      choices.map((choice) => <ChoiceControl tick={tick} choice={choice} />)
    );

  return <div>{choiceList}</div>;
}
