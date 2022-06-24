import React from "react";
import { css } from "@emotion/css";
import { RuntimeStatus } from "../state/use-story-loader";
import { StoryMachineStatus } from "@story-machines/core";

interface TextDisplayProps {
  text: string;
  loaderStatus: RuntimeStatus;
  storyStatus: StoryMachineStatus | undefined;
}

function getContents({ text, loaderStatus, storyStatus }: TextDisplayProps) {
  if (loaderStatus === "Loading") {
    return "Loading...";
  } else if (loaderStatus === "Error") {
    return "An error has occurred in the Story loader";
  } else if (storyStatus === "Terminated") {
    return "An error has occurred in the Story machine";
  } else if (storyStatus === "Completed") {
    return "The end.";
  } else {
    return text;
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
