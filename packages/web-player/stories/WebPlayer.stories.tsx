import { ChoiceElements } from "@story-machines/choices";
import { PassageElements } from "@story-machines/passages";
import React from "react";
import { WebPlayer } from "../src/components/WebPlayer";

export default {
  title: "Example/WebPlayer",
  component: WebPlayer,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
};

const Template = (args) => <WebPlayer {...args} />;

const story = `
  <Passage>
    <PassageText>This is a story machine.</PassageText>
    <Choices>
      <Choice>
        <ChoiceText>Say more</ChoiceText>
        <Passage>
          <PassageText>It's an abstraction for building interactive narratives.</PassageText>
          <Choices>
            <Choice>
              <ChoiceText>Neat!</ChoiceText>
            </Choice>
          </Choices>
        </Passage>
      </Choice>
      <Choice>
        <ChoiceText>I already know this</ChoiceText>
        <Text>Well alrighty then. Goodbye!</Text>
      </Choice>
    </Choices>
  </Passage>
`;

export const WithStory = Template.bind({});
WithStory.args = {
  main: "/main",
  fileMaps: {
    story: { "/main": story },
  },
  additionalMachines: { ...ChoiceElements, ...PassageElements },
};
