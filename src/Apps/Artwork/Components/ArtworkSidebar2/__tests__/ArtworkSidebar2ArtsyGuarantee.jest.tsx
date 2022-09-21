import { screen } from "@testing-library/react"
import { ArtworkSidebar2ArtsyGuarantee } from "../ArtworkSidebar2ArtsyGuarantee"
import { render } from "DevTools/setupTestWrapper"

describe("ArtworkSidebar2ArtsyGuarantee", () => {
  it("renders the Artsy Guarantee section", async () => {
    render(<ArtworkSidebar2ArtsyGuarantee />)

    expect(screen.queryByText("Secure Payment")).toBeInTheDocument()
    expect(screen.queryByText("Money-Back Guarantee")).toBeInTheDocument()
    expect(screen.queryByText("Authenticity Guarantee")).toBeInTheDocument()

    expect(screen.queryByText("Learn more")).toBeInTheDocument()
  })
})