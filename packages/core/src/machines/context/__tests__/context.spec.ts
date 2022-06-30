import { StoryMachineRuntime } from "../../../runtime";
import { TestPlayer } from "../../../test-player";
import { createEmptyContext } from "../../../utils/create-empty-context";
import { SetContextInternal } from "../set-context";
import { SetGlobalContextInternal } from "../set-global-context";

const runtime = new StoryMachineRuntime();

describe("Context", () => {
  it("creates a scope that is accessible to child elements, but not to siblings or parents", () => {
    const story = `
      <Sequence>
        <Scoped>
          <Sequence>
            <SetContext key="foo">"bar"</SetContext>
            <SetGlobalContext key="innerCtx">$ctx["foo"]</SetContextGlobal>
          </Sequence>
        </Scoped>
        <SetGlobalContext key="outerCtx">$ctx["foo"]</SetContextGlobal>
      </Sequence>
    `;

    const player = new TestPlayer(runtime, story);
    player.tick();
    expect(player.currentContext).toMatchObject({
      innerCtx: "bar",
      outerCtx: null,
    });
  });

  it("sets context using internal functions", () => {
    const machine = new SetContextInternal({
      key: "foo",
      valFn: (context) => context.val,
    });

    const context = createEmptyContext();
    const scope = { id: "abc123", scope: {} };
    context.__SCOPES__.push(scope);
    context.val = "bar";

    machine.process(context);

    expect(scope.scope).toEqual({ foo: "bar" });
  });

  it("sets global context using internal functions", () => {
    const machine = new SetGlobalContextInternal({
      key: "foo",
      valFn: (context) => context.val,
    });

    const context = {
      ...createEmptyContext(),
      val: "bar",
    };

    machine.process(context);

    expect(context).toMatchObject({ foo: "bar" });
  });
});
