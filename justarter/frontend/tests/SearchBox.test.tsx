import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchBox } from "../src/components/SearchBox";
import type { Suggestion } from "../src/hooks/useSuggestionSearch";

const { queryMock, apolloClientMock } = vi.hoisted(() => {
  const query = vi.fn();
  return {
    queryMock: query,
    apolloClientMock: { query },
  };
});

vi.mock("@apollo/client", async () => {
  const actual = await vi.importActual<typeof import("@apollo/client")>("@apollo/client");
  return {
    ...actual,
    useApolloClient: () => apolloClientMock,
  };
});

const suggestions: Suggestion[] = [
  {
    id: "1",
    term: "ação civil pública",
    popularity: 95,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    term: "ação de alimentos",
    popularity: 90,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

function response(items: Suggestion[]) {
  return { data: { suggestions: items } };
}

async function finishDebounce() {
  await act(async () => {
    vi.advanceTimersByTime(250);
    await Promise.resolve();
  });
}

function deferredResponse() {
  let resolve!: (value: ReturnType<typeof response>) => void;
  const promise = new Promise<ReturnType<typeof response>>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

describe("SearchBox", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    queryMock.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("não consulta com menos de quatro caracteres", async () => {
    render(<SearchBox />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "abc" } });
    await finishDebounce();

    expect(queryMock).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("aplica debounce e consulta no máximo 20 sugestões", async () => {
    queryMock.mockResolvedValue(response(suggestions));
    render(<SearchBox />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ação" } });

    act(() => vi.advanceTimersByTime(249));
    expect(queryMock).not.toHaveBeenCalled();

    await finishDebounce();

    expect(queryMock).toHaveBeenCalledOnce();
    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { query: "ação", limit: 20 },
        fetchPolicy: "network-only",
      }),
    );
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getAllByText("ação", { selector: "strong" })).toHaveLength(2);
    expect(document.querySelector(".suggestion-label")).toHaveTextContent(
      "ação civil pública",
    );
  });

  it("limita a renderização a 20 resultados", async () => {
    const manySuggestions = Array.from({ length: 25 }, (_, index) => ({
      ...suggestions[0],
      id: String(index + 1),
      term: `ação ${index + 1}`,
    }));
    queryMock.mockResolvedValue(response(manySuggestions));
    render(<SearchBox />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ação" } });
    await finishDebounce();

    expect(screen.getAllByRole("option")).toHaveLength(20);
  });

  it("ignora a resposta de uma pesquisa antiga", async () => {
    const oldRequest = deferredResponse();
    const currentRequest = deferredResponse();
    queryMock
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(currentRequest.promise);
    render(<SearchBox />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ação" } });
    await finishDebounce();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ações" } });
    await finishDebounce();

    await act(async () => {
      currentRequest.resolve(
        response([{ ...suggestions[0], id: "3", term: "ações possessórias" }]),
      );
      await currentRequest.promise;
    });

    await act(async () => {
      oldRequest.resolve(response(suggestions));
      await oldRequest.promise;
    });

    expect(
      screen.getByRole("option", { name: /ações possessórias/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /ação civil pública/i }),
    ).not.toBeInTheDocument();
  });

  it("atualiza o campo e fecha a lista ao selecionar uma sugestão", async () => {
    queryMock.mockResolvedValue(response(suggestions));
    render(<SearchBox />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "ação" } });
    await finishDebounce();
    fireEvent.click(screen.getByRole("option", { name: /ação civil pública/i }));

    expect(input).toHaveValue("ação civil pública");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await finishDebounce();
    expect(queryMock).toHaveBeenCalledOnce();
  });

  it("permite selecionar uma sugestão pelo teclado", async () => {
    queryMock.mockResolvedValue(response(suggestions));
    render(<SearchBox />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "ação" } });
    await finishDebounce();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(input).toHaveValue("ação de alimentos");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("destaca uma sugestão tocada", async () => {
    queryMock.mockResolvedValue(response(suggestions));
    render(<SearchBox />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ação" } });
    await finishDebounce();

    const option = screen.getByRole("option", { name: /ação civil pública/i });
    fireEvent.touchStart(option);

    expect(option).toHaveAttribute("aria-selected", "true");
  });

  it("trata falhas sem exibir a lista", async () => {
    queryMock.mockRejectedValue(new Error("gateway indisponível"));
    render(<SearchBox />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ação" } });
    await finishDebounce();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível buscar sugestões.",
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("oculta a lista quando não há resultados", async () => {
    queryMock.mockResolvedValue(response([]));
    render(<SearchBox />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "ação" } });
    await finishDebounce();

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
