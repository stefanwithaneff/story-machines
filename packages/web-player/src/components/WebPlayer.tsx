import React from "react";
import { css } from "@emotion/css";
import { StoryMachineRuntime } from "@story-machines/core";
import { StoryParams, useStory } from "../state/use-story";
import { FileType } from "../state/query-client";
import { TextDisplay } from "./TextDisplay";
import { InputControls } from "./InputControls";

interface Theme {}

interface WebPlayerProps extends StoryParams {
  theme?: Theme;
}

export function WebPlayer({
  baseUrl,
  main,
  fileMaps,
  additionalMachines,
}: WebPlayerProps) {
  const { output, storyStatus, loaderStatus, tick } = useStory({
    main,
    baseUrl,
    fileMaps,
    additionalMachines,
  });

  return (
    <div
      className={css`
        margin: 0 auto;
        max-width: 800px;
        min-width: 40rem;
        width: 50%;
        height: 100vh;
      `}
    >
      <div
        className={css`
          display: flex;
          height: 66%;
          width: 100%;
        `}
      >
        <TextDisplay
          text={output?.passages?.[0].text}
          loaderStatus={loaderStatus}
          storyStatus={storyStatus}
        />
      </div>
      <div
        className={css`
          height: 34%;
          width: 100%;
        `}
      >
        <InputControls
          storyStatus={storyStatus}
          choices={output?.choices}
          tick={tick}
        />
      </div>
    </div>
  );
}
