import loadable from "@loadable/component"
import { graphql } from "react-relay"
import { AppRouteConfig } from "System/Router/Route"
import { isArtsyEmail } from "Utils/isArtsyEmail"

const CollectorProfileApp = loadable(
  () =>
    import(
      /* webpackChunkName: "collectorProfileBundle" */ "./CollectorProfileApp"
    ),
  {
    resolveComponent: component =>
      component.CollectorProfileAppFragmentContainer,
  }
)

const MyCollectionRoute = loadable(
  () =>
    import(
      /* webpackChunkName: "collectorProfileBundle" */ "./Routes/MyCollection/CollectorProfileMyCollectionRoute"
    ),
  {
    resolveComponent: component =>
      component.CollectorProfileMyCollectionRoutePaginationContainer,
  }
)

const InsightsRoute = loadable(
  () =>
    import(
      /* webpackChunkName: "collectorProfileBundle" */ "./Routes/Insights/CollectorProfileInsightsRoute"
    ),
  {
    resolveComponent: component =>
      component.CollectorProfileInsightsRouteFragmentContainer,
  }
)

const SavesAndFollowsRoute = loadable(
  () =>
    import(
      /* webpackChunkName: "collectorProfileBundle" */ "./Routes/SavesAndFollows/CollectorProfileSavesAndFollowsRoute"
    ),
  {
    resolveComponent: component =>
      component.CollectorProfileSavesAndFollowsRouteFragmentContainer,
  }
)

const FollowsRoute = loadable(
  () =>
    import(
      /* webpackChunkName: "collectorProfileBundle" */ "./Routes/Follows/CollectorProfileFollowsRoute"
    ),
  {
    resolveComponent: component =>
      component.CollectorProfileFollowsRouteFragmentContainer,
  }
)

const MyCollectionCreateArtwork = loadable(
  () =>
    import(
      /* webpackChunkName: "collectorProfileBundle" */ "../../Apps/MyCollection/Routes/EditArtwork/MyCollectionCreateArtwork"
    ),
  {
    resolveComponent: component =>
      component.MyCollectionCreateArtworkFragmentContainer,
  }
)

const MyCollectionArtwork = loadable(
  () =>
    import(
      /* webpackChunkName: "collectorProfileBundle" */ "../../Apps/MyCollection/Routes/MyCollectionArtwork/MyCollectionArtwork"
    ),
  {
    resolveComponent: component =>
      component.MyCollectionArtworkFragmentContainer,
  }
)

const MyCollectionEditArtwork = loadable(
  () =>
    import(
      /* webpackChunkName: "collectorProfileBundle" */ "../../Apps/MyCollection/Routes/EditArtwork/MyCollectionEditArtwork"
    ),
  {
    resolveComponent: component =>
      component.MyCollectionEditArtworkFragmentContainer,
  }
)

const PriceEstimateContactInformation = loadable(
  () =>
    import(
      /* webpackChunkName: "collectorProfileBundle" */ "../../Apps/MyCollection/Routes/PriceEstimate/PriceEstimateContactInformation"
    ),
  {
    resolveComponent: component =>
      component.PriceEstimateContactInformationFragmentContainer,
  }
)

const PriceEstimateConfirmation = loadable(
  () =>
    import(
      /* webpackChunkName: "collectorProfileBundle" */ "../../Apps/MyCollection/Routes/PriceEstimate/PriceEstimateConfirmation"
    ),
  {
    resolveComponent: component => component.PriceEstimateConfirmation,
  }
)

// Redirect home if the user is not logged in
const handleServerSideRender = () => {
  // TODO: Redirect to the logged out experience once released
}

export const collectorProfileRoutes: AppRouteConfig[] = [
  {
    path: "/collector-profile",
    getComponent: () => CollectorProfileApp,
    onClientSideRender: () => {
      CollectorProfileApp.preload()
    },
    query: graphql`
      query collectorProfileRoutes_CollectorProfileQuery {
        me {
          ...CollectorProfileApp_me
        }
      }
    `,
    children: [
      {
        path: "my-collection",
        getComponent: () => MyCollectionRoute,
        onClientSideRender: () => {
          MyCollectionRoute.preload()
        },
        query: graphql`
          query collectorProfileRoutes_MyCollectionRouteQuery {
            me {
              ...MyCollectionRoute_me
            }
          }
        `,
        cacheConfig: { force: true },
      },
      {
        path: "insights",
        getComponent: () => InsightsRoute,
        onClientSideRender: () => {
          InsightsRoute.preload()
        },
        onServerSideRender: handleServerSideRender,
        query: graphql`
          query collectorProfileRoutes_InsightsRouteQuery {
            me {
              ...InsightsRoute_me
            }
          }
        `,
      },
      {
        path: "saves/:id?",
        ignoreScrollBehavior: true,
        getComponent: () => SavesAndFollowsRoute,
        onClientSideRender: () => {
          SavesAndFollowsRoute.preload()
        },
        onServerSideRender: handleServerSideRender,
        prepareVariables: (_, { context }) => {
          const featureFlags = context?.featureFlags ?? {}
          const featureFlag = featureFlags["force-enable-artworks-list"]
          const isFeatureFlagEnabled = featureFlag?.flagEnabled ?? false
          const isArtsyEmployee = isArtsyEmail(context?.user?.email ?? "")
          const isIntegrityUser =
            context?.user?.email === "cypress+test@example.com"
          const isArtworkListsFlagEnabled =
            isFeatureFlagEnabled && (isArtsyEmployee || isIntegrityUser)

          return {
            shouldFetchArtworkListsData: isArtworkListsFlagEnabled,
          }
        },
        query: graphql`
          query collectorProfileRoutes_SavesAndFollowsRouteQuery(
            $shouldFetchArtworkListsData: Boolean!
          ) {
            me {
              ...CollectorProfileSavesAndFollowsRoute_me
                @arguments(
                  shouldFetchArtworkListsData: $shouldFetchArtworkListsData
                )
            }
          }
        `,
      },
      {
        path: "follows",
        getComponent: () => FollowsRoute,
        onClientSideRender: () => {
          FollowsRoute.preload()
        },
        onServerSideRender: handleServerSideRender,
        query: graphql`
          query collectorProfileRoutes_FollowsRouteQuery {
            me {
              ...CollectorProfileFollowsRoute_me
            }
          }
        `,
      },
    ],
  },
  {
    path: "/collector-profile/my-collection/artworks/new",
    layout: "ContainerOnly",
    getComponent: () => MyCollectionCreateArtwork,
    onClientSideRender: () => {
      MyCollectionCreateArtwork.preload()
    },
    query: graphql`
      query collectorProfileRoutes_MyCollectionArtworkUploadQuery {
        me {
          ...MyCollectionCreateArtwork_me
        }
      }
    `,
  },
  {
    path: "/collector-profile/my-collection/artwork/:artworkID",
    getComponent: () => MyCollectionArtwork,
    onClientSideRender: () => {
      MyCollectionArtwork.preload()
    },
    query: graphql`
      query collectorProfileRoutes_ArtworkQuery($artworkID: String!) {
        artwork(id: $artworkID) @principalField {
          ...MyCollectionArtwork_artwork
        }
      }
    `,
    cacheConfig: {
      force: true,
    },
  },
  {
    path: "/collector-profile/my-collection/artworks/:slug/edit",
    layout: "ContainerOnly",
    getComponent: () => MyCollectionEditArtwork,
    onClientSideRender: () => {
      MyCollectionEditArtwork.preload()
    },
    query: graphql`
      query collectorProfileRoutes_MyCollectionArtworkFormQuery(
        $slug: String!
      ) {
        artwork(id: $slug) {
          ...MyCollectionEditArtwork_artwork
        }
      }
    `,
    cacheConfig: {
      force: true,
    },
  },
  {
    path: "/collector-profile/my-collection/artwork/:artworkID/price-estimate",
    layout: "ContainerOnly",
    getComponent: () => PriceEstimateContactInformation,
    onClientSideRender: () => {
      PriceEstimateContactInformation.preload()
    },
    query: graphql`
      query collectorProfileRoutes_priceEstimateContactInformationQuery(
        $artworkID: String!
      ) {
        artwork(id: $artworkID) @principalField {
          ...PriceEstimateContactInformation_artwork
        }
        me {
          ...PriceEstimateContactInformation_me
        }
      }
    `,
  },
  {
    path:
      "/collector-profile/my-collection/artwork/:artworkID/price-estimate/success",
    layout: "ContainerOnly",
    getComponent: () => PriceEstimateConfirmation,
    onClientSideRender: () => {
      PriceEstimateConfirmation.preload()
    },
  },
]
