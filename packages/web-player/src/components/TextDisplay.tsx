import { css } from "@emotion/css";
import { StoryMachineStatus } from "@story-machines/core";
import { Passage } from "@story-machines/passages";
import { RuntimeStatus } from "../state/use-story-loader";

interface TextDisplayProps {
  passages: Passage[];
  loaderStatus: RuntimeStatus;
  storyStatus: StoryMachineStatus | undefined;
}

function getContents({
  passages,
  loaderStatus,
  storyStatus,
}: TextDisplayProps) {
  if (loaderStatus === "Loading" || storyStatus === undefined) {
    return "Loading...";
  } else if (loaderStatus === "Error") {
    return "An error has occurred in the Story loader";
  } else if (storyStatus === "Terminated") {
    return "An error has occurred in the Story machine";
  } else if (storyStatus === "Completed") {
    return "The end.";
  } else {
    return passages.map((passage) => <p>{passage.text}</p>);
  }
}

export function TextDisplay(props: TextDisplayProps) {
  return (
    <main
      className={css`
        margin: auto;
      `}
    >
      {getContents(props)}
    </main>
  );
}
