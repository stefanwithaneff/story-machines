import {
  Context,
  createEmptyContext,
  Effect,
  Input,
  Output,
  Result,
  StoryMachine,
  StoryMachineCompiler,
  StoryMachineRuntime,
  StoryMachineStatus,
} from "@story-machines/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useStoryLoader,
  StoryLoaderParams,
  RuntimeStatus,
} from "./use-story-loader";

export interface StoryParams extends StoryLoaderParams {
  additionalMachines?: Record<string, StoryMachineCompiler>;
  externalContext?: Record<string, any>; // Additional context that is always added for each tick of the story machine
  // Functions that respond to effects emitted by the main story machine
  effectHandlers?: Record<
    string,
    ((effect: Effect) => void) | ((effect: Effect) => Promise<void>)
  >;
}

export interface StoryOutput {
  storyStatus: StoryMachineStatus | undefined;
  loaderStatus: RuntimeStatus;
  output: Output | undefined;
  tick: (input?: Input) => void;
}

export function useStory(params: StoryParams): StoryOutput {
  const { stories, status } = useStoryLoader(params);
  const runtime = useMemo(() => {
    const rt = new StoryMachineRuntime();
    if (params.additionalMachines) {
      rt.registerElements(params.additionalMachines);
    }
    return rt;
  }, []);
  const [storyMachine, setStoryMachine] = useState<StoryMachine | undefined>();
  const [currentStatus, setCurrentStatus] =
    useState<StoryMachineStatus | undefined>();
  const [currentOutput, setCurrentOutput] = useState<Output | undefined>();

  // Initialize Story Machine when preloading phase is done
  useEffect(() => {
    if (!storyMachine && status === "Ready") {
      const machine = runtime.compileXML(stories[params.main]);
      if (machine instanceof StoryMachine) {
        setStoryMachine(machine);
      }
    }
  }, [storyMachine, setStoryMachine, status, runtime, stories, params.main]);

  const tick = useCallback(
    async (input?: Input) => {
      if (!storyMachine) {
        return;
      }
      let context: Context;
      let result: Result;
      do {
        context = createEmptyContext({ ...params.externalContext, input });
        result = storyMachine.process(context);

        for (const effect of context.output.effects) {
          const handler = params.effectHandlers?.[effect.type];
          if (handler) {
            await handler(effect);
          }
        }
      } while (
        result.status === "Running" &&
        !context.output?.choices &&
        !context.output?.passages
      );
      setCurrentStatus(() => result.status);
      setCurrentOutput(() => context.output);
    },
    [storyMachine]
  );

  // Initiate first tick
  useEffect(() => {
    tick();
  }, [tick]);

  return {
    loaderStatus: status,
    storyStatus: currentStatus,
    output: currentOutput,
    tick,
  };
}
