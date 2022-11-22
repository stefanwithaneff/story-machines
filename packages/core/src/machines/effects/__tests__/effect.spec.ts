import { StoryMachineRuntime } from "../../../runtime";
import { TestPlayer } from "../../../test-player";
import { createEmptyContext } from "../../../utils/create-empty-context";
import { Expression } from "../../../utils/expression-parser";
import { AddEffectInternal } from "../add-effect";
import { EFFECT_TYPE } from "../constants";
import {
  createDevErrorEffect,
  DEV_ERROR,
  isDevErrorEffect,
} from "../dev-error";
import { createDevWarnEffect, DEV_WARN, isDevWarnEffect } from "../dev-warn";

const runtime = new StoryMachineRuntime();

describe("Effect", () => {
  it("adds an effect to the output", () => {
    const story = `
      <Effect type="test">
        <Value key="foo">"bar"</Value>
      </Effect>
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    expect(player.currentStatus).toBe("Completed");
    expect(player.currentOutput?.effects).toEqual([
      { type: "test", payload: { foo: "bar" } },
    ]);
  });

  it("supports an empty payload", () => {
    const story = `
      <Effect type="test" />
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    expect(player.currentStatus).toBe("Completed");
    expect(player.currentOutput?.effects).toEqual([
      { type: "test", payload: {} },
    ]);
  });

  it("terminates if type is not defined", () => {
    const story = `
      <Effect />
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();

    expect(player.currentStatus).toBe("Terminated");
  });

  describe("Dev Effects", () => {
    it("creates an effect for emitting warnings during development", () => {
      const effect = createDevWarnEffect({ message: "test warn" });
      expect(effect).toEqual({
        type: DEV_WARN,
        payload: { message: "test warn" },
      });

      const notEffect = { type: "notWarn", payload: {} };
      expect(isDevWarnEffect(effect)).toBe(true);
      expect(isDevWarnEffect(notEffect)).toBe(false);
    });
    it("creates an effect for emitting errors during development", () => {
      const effect = createDevErrorEffect({ message: "test error" });
      expect(effect).toEqual({
        type: DEV_ERROR,
        payload: { message: "test error" },
      });

      const notEffect = { type: "notError", payload: {} };
      expect(isDevErrorEffect(effect)).toBe(true);
      expect(isDevErrorEffect(notEffect)).toBe(false);
    });
  });
});
