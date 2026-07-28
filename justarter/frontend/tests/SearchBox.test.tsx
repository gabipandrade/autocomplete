import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchBox } from "../src/components/SearchBox";

vi.mock("@apollo/client", async () => {
  const actual = await vi.importActual<typeof import("@apollo/client")>("@apollo/client");
  return {
    ...actual,
    useLazyQuery: () => [vi.fn(), { loading: false, error: undefined, data: undefined }],
  };
});

describe("SearchBox", () => {
  it("renderiza o campo de busca", () => {
    render(<SearchBox />);
    expect(screen.getByPlaceholderText(/pesquise por um termo/i)).toBeInTheDocument();
  });
});
