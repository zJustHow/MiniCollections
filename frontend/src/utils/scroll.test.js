import { scrollAppToTop } from "./scroll";

describe("scrollAppToTop", () => {
  test("scrolls main content and window", () => {
    const main = document.createElement("main");
    main.id = "main-content";
    Object.defineProperty(main, "scrollTop", { writable: true, value: 100 });
    document.body.appendChild(main);

    const windowScroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    scrollAppToTop();

    expect(main.scrollTop).toBe(0);
    expect(windowScroll).toHaveBeenCalledWith(0, 0);
    expect(document.documentElement.scrollTop).toBe(0);
    expect(document.body.scrollTop).toBe(0);
  });
});
