import React from "react";
import { WebDisplay } from "../src/components/WebDisplay";
import { StoryOutput } from "../src/state/use-story";

export default {
  title: "Example/WebDisplay",
  component: WebDisplay,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
};

const defaultArgs: StoryOutput = {
  loaderStatus: "Ready",
  storyStatus: undefined,
  output: undefined,
  tick: () => {},
};

const Template = (args) => <WebDisplay {...args} />;

export const Loading = Template.bind({});
Loading.args = { ...defaultArgs, loaderStatus: "Loading" };

export const FullOutput = Template.bind({});
FullOutput.args = {
  ...defaultArgs,
  storyStatus: "Running",
  output: {
    passages: [
      {
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id velit id justo iaculis maximus.
      Proin volutpat malesuada urna vitae porta. Maecenas bibendum, odio vitae ultrices convallis, ipsum odio
      vestibulum orci, quis eleifend est turpis quis leo. Duis nec lacus neque. Nullam cursus turpis quis
      urna aliquam, et sagittis mi viverra. Fusce feugiat ut leo laoreet porttitor. Duis placerat ligula at
      euismod tempor. Morbi egestas lacus gravida arcu dictum blandit. Nunc venenatis pellentesque ante, ut
      accumsan odio ullamcorper in. Curabitur ut orci faucibus, bibendum tortor eu, fermentum ex. Vivamus
      ultrices ullamcorper mauris sed fringilla. `,
        metadata: {},
      },
    ],
    choices: [
      {
        id: "1",
        text: "Do the thing",
        metadata: {},
      },
      {
        id: "2",
        text: "Do the other thing",
        metadata: {},
      },
      {
        id: "3",
        text: "Do the other other thing",
        metadata: {},
      },
    ],
    effects: [],
  },
};
