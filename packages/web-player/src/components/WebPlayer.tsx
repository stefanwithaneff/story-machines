import { StoryParams, useStory } from "../state/use-story";
import { WebDisplay } from "./WebDisplay";

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
  const storyOutput = useStory({
    main,
    baseUrl,
    fileMaps,
    additionalMachines,
  });

  return <WebDisplay {...storyOutput} />;
}
