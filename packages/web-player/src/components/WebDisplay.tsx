import { css } from "@emotion/css";
import { TextDisplay } from "./TextDisplay";
import { InputControls } from "./InputControls";
import { StoryOutput } from "../state/use-story";

export function WebDisplay({
  output,
  loaderStatus,
  storyStatus,
  tick,
}: StoryOutput) {
  return (
    <div
      className={css`
        margin: 0 auto;
        max-width: 800px;
        min-width: 600px;
        width: 50%;
        height: 100vh;

        @media (max-width: 600px) {
          min-width: 0;
          width: 98%;
        }
      `}
    >
      <div
        className={css`
          display: flex;
          min-height: 66%;
          width: 100%;
        `}
      >
        <TextDisplay
          passages={output?.passages}
          loaderStatus={loaderStatus}
          storyStatus={storyStatus}
        />
      </div>
      <div
        className={css`
          min-height: 34%;
          width: 100%;
        `}
      >
        <InputControls
          loaderStatus={loaderStatus}
          storyStatus={storyStatus}
          choices={output?.choices}
          tick={tick}
        />
      </div>
    </div>
  );
}
