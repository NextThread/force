import { IdentityVerificationAppTestQueryRawResponse } from "__generated__/IdentityVerificationAppTestQuery.graphql"
import deepMerge from "deepmerge"
import { createTestEnv } from "DevTools/createTestEnv"
import { graphql } from "react-relay"
import { IdentityVerificationAppQueryResponseFixture } from "../__fixtures__/routes_IdentityVerificationAppQuery"
import { IdentityVerificationAppFragmentContainer } from "../IdentityVerificationApp"
import { IdentityVerificationAppTestPage } from "./Utils/IdentityVerificationAppTestPage"
import { mockLocation } from "DevTools/mockLocation"
import { HttpError } from "found"
import { Toasts, ToastsProvider } from "@artsy/palette"

jest.unmock("react-relay")
jest.unmock("react-tracking")
jest.mock("Utils/Events", () => ({
  postEvent: jest.fn(),
}))
jest.mock("found")

const mockPostEvent = require("Utils/Events").postEvent as jest.Mock

const setupTestEnv = () => {
  return createTestEnv({
    TestPage: IdentityVerificationAppTestPage,
    Component: props => (
      <ToastsProvider>
        <Toasts />
        <IdentityVerificationAppFragmentContainer {...props} />
      </ToastsProvider>
    ),
    query: graphql`
      query IdentityVerificationAppTestQuery
        @raw_response_type
        @relay_test_operation {
        identityVerification(id: "identity-verification-id") {
          ...IdentityVerificationApp_identityVerification
            @arguments(id: "identity-verification-id")
        }
      }
    `,
    defaultData: IdentityVerificationAppQueryResponseFixture as IdentityVerificationAppTestQueryRawResponse,
    defaultMutationResults: {
      startIdentityVerification: {
        startIdentityVerificationResponseOrError: {
          identityVerificationFlowUrl: "www.identity.biz",
          mutationError: null,
        },
      },
    },
  })
}

describe("IdentityVerification route", () => {
  describe("for a visitor", () => {
    describe("unactionable end states", () => {
      it("returns a 404 when the identity verification is not found", async () => {
        const mockHttpError = HttpError as jest.Mock
        const env = setupTestEnv()
        await env.buildPage({
          mockData: deepMerge(IdentityVerificationAppQueryResponseFixture, {
            identityVerification: null,
          }),
        })
        expect(mockHttpError).toHaveBeenCalledWith(404)
      })

      it("renders a message about an identity verification that is `passed`", async () => {
        const env = setupTestEnv()

        const page = await env.buildPage({
          mockData: deepMerge(IdentityVerificationAppQueryResponseFixture, {
            identityVerification: {
              state: "passed",
            },
          }),
        })

        expect(page.text()).toContain("Identity verification complete")
        expect(page.startVerificationButton.exists()).toBeFalsy()
        expect(page.finishButton.exists()).toBeTruthy()
      })

      it("renders a message about an identity verification that is `failed`", async () => {
        const env = setupTestEnv()

        const page = await env.buildPage({
          mockData: deepMerge(IdentityVerificationAppQueryResponseFixture, {
            identityVerification: {
              state: "failed",
            },
          }),
        })

        expect(page.text()).toContain("Identity verification failed")
        expect(page.startVerificationButton.exists()).toBeFalsy()
        expect(page.contactSupportButton.exists()).toBeTruthy()
      })

      it("renders a message about an identity verification that is `watchlist_hit`", async () => {
        const env = setupTestEnv()

        const page = await env.buildPage({
          mockData: deepMerge(IdentityVerificationAppQueryResponseFixture, {
            identityVerification: {
              state: "watchlist_hit",
            },
          }),
        })

        expect(page.text()).toContain(
          "Artsy is reviewing your identity verification"
        )
        expect(page.startVerificationButton.exists()).toBeFalsy()
        expect(page.returnHomeButton.exists()).toBeTruthy()
      })
    })

    it("allows an identity verification instance's owner to view the landing page", async () => {
      const env = setupTestEnv()
      const page = await env.buildPage()

      expect(page.text()).toContain("Artsy identity verification")
    })

    describe("user enters verification flow", () => {
      beforeAll(() => {
        mockLocation()
      })

      it("user click on 'continue to verification' button is tracked", async () => {
        const env = setupTestEnv()
        const page = await env.buildPage()

        await page.clickStartVerification()

        expect(mockPostEvent).toHaveBeenCalledTimes(1)
        expect(mockPostEvent).toHaveBeenCalledWith({
          action_type: "ClickedContinueToIdVerification",
          context_page: "Identity Verification page",
          context_page_owner_id: "identity-verification-id",
        })
      })

      it("user is redirected to the verification flow on a successful mutation", async () => {
        const env = setupTestEnv()
        const page = await env.buildPage()

        await page.clickStartVerification()
        expect(window.location.assign).toHaveBeenCalledWith("www.identity.biz")
      })

      it("user sees an error toast if the mutation fails", async () => {
        const env = setupTestEnv()
        const page = await env.buildPage()
        const badResult = {
          startIdentityVerification: {
            startIdentityVerificationResponseOrError: {
              mutationError: {
                error: "something bad :|",
                message: "oh noes",
                detail: "beep boop beep",
              },
            },
          },
        }
        env.mutations.useResultsOnce(badResult)

        await page.clickStartVerification()
        expect(page.text()).toContain(
          "Something went wrong. Please try again or contact verification@artsy.net."
        )
      })

      it("shows an error message on network failiure", async () => {
        const env = setupTestEnv()
        const page = await env.buildPage()
        env.mutations.mockNetworkFailureOnce()

        await page.clickStartVerification()
        expect(page.text()).toContain(
          "Something went wrong. Please try again or contact verification@artsy.net."
        )
      })
    })
  })
})