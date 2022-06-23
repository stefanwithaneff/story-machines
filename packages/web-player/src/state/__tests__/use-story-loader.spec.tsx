import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import fetchMock from "fetch-mock-jest";
import { StoryLoaderParams, useStoryLoader } from "../use-story-loader";
import { act } from "react-dom/test-utils";

describe("useStoryLoader hook", () => {
  const render = (params: StoryLoaderParams) =>
    renderHook(() => useStoryLoader(params));

  beforeEach(() => {});

  afterEach(() => {
    fetchMock.reset();
  });

  it("attempts to download the main story on first run", async () => {
    const baseUrl = "https://story.com";
    fetchMock.get(`${baseUrl}/test`, "foo bar");
    const { result } = render({ main: "/test", baseUrl });

    expect(result.current.status).toBe("Loading");
    expect(result.current.stories["/test"]).toBe(undefined);
    await waitFor(() => expect(result.current.status).toBe("Ready"));
    expect(result.current.stories["/test"]).toBe("foo bar");
  });

  it("does not attempt to download the main story if it is prefetched", () => {
    const baseUrl = "https://story.com";
    const { result } = render({
      main: "/test",
      baseUrl,
      fileMaps: { story: { "/test": "foo bar" }, manifest: {} },
    });

    expect(result.current.status).toBe("Ready");
    expect(result.current.stories["/test"]).toBe("foo bar");
  });

  it("attempts to download stories or manifests that are listed as null in the provided maps", async () => {
    const baseUrl = "https://story.com";
    fetchMock
      .get(`${baseUrl}/test`, "foo bar")
      .get(`${baseUrl}/foo`, "fizz buzz")
      .get(`${baseUrl}/bar/baz`, "hello world")
      .get(`${baseUrl}/mani`, { files: ["a", "b", "c"] }, { sendAsJson: true });
    const { result } = render({
      main: "/test",
      baseUrl,
      fileMaps: {
        story: { "/foo": null, "/bar/baz": null },
        manifest: { "/mani": null },
      },
    });

    expect(result.current.status).toBe("Loading");
    await waitFor(() => expect(result.current.status).toBe("Ready"));
    expect(result.current.stories).toEqual({
      "/test": "foo bar",
      "/foo": "fizz buzz",
      "/bar/baz": "hello world",
    });
    expect(result.current.manifests).toEqual({
      "/mani": { files: ["a", "b", "c"] },
    });
  });

  it("refreshes the data when requesting a single file", async () => {
    const baseUrl = "https://story.com";
    fetchMock
      .get(`${baseUrl}/foo`, "fizz buzz")
      .get(`${baseUrl}/mani`, { files: ["a", "b", "c"] }, { sendAsJson: true });
    const { result } = render({
      main: "/test",
      baseUrl,
      fileMaps: { story: { "/test": "foo bar" }, manifest: {} },
    });

    expect(result.current.status).toBe("Ready");
    await act(async () => {
      await result.current.loadFile({ type: "story", filePath: "/foo" });
      await result.current.loadFile({ type: "manifest", filePath: "/mani" });
    });
    expect(result.current.stories).toEqual({
      "/test": "foo bar",
      "/foo": "fizz buzz",
    });
    expect(result.current.manifests).toEqual({
      "/mani": { files: ["a", "b", "c"] },
    });
  });
  it("enters the loading state when requesting a single file", async () => {
    const baseUrl = "https://story.com";
    fetchMock.get(`${baseUrl}/foo`, "fizz buzz", { delay: 500 });
    const { result } = render({
      main: "/test",
      baseUrl,
      fileMaps: { story: { "/test": "foo bar" }, manifest: {} },
    });

    expect(result.current.status).toBe("Ready");
    await act(async () => {
      result.current.loadFile({ type: "story", filePath: "/foo" });
    });
    await waitFor(() => expect(result.current.status).toBe("Loading"));
    await waitFor(() => expect(result.current.status).toBe("Ready"));
    expect(result.current.stories).toEqual({
      "/test": "foo bar",
      "/foo": "fizz buzz",
    });
  });
  it("returns request state of failed requests if an error occurs", async () => {
    const baseUrl = "https://story.com";
    fetchMock.get(`${baseUrl}/foo`, { throws: new Error("test error") });
    const { result } = render({
      main: "/test",
      baseUrl,
      fileMaps: { story: { "/test": "foo bar" }, manifest: {} },
    });

    expect(result.current.status).toBe("Ready");
    await act(async () => {
      await result.current.loadFile({ type: "story", filePath: "/foo" });
    });

    expect(result.current.status).toBe("Error");
    expect(result.current.failedRequests).toEqual([
      [
        "/foo",
        {
          status: "Error",
          data: null,
          error: expect.any(Error),
          type: "story",
        },
      ],
    ]);
  });
});
