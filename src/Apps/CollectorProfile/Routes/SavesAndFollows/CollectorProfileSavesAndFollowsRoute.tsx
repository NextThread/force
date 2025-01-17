import { CollectorProfileSavesAndFollowsRoute_me$data } from "__generated__/CollectorProfileSavesAndFollowsRoute_me.graphql"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { CollectorProfileSavesRouteQueryRenderer } from "Apps/CollectorProfile/Routes/Saves/CollectorProfileSavesRoute"
import { CollectorProfileSaves2RouteFragmentContainer } from "Apps/CollectorProfile/Routes/Saves2/CollectorProfileSaves2Route"
import { useCheckIfArtworkListsEnabled } from "Apps/CollectorProfile/Routes/Saves2/useCheckIfArtworkListsEnabled"

interface CollectorProfileSavesAndFollowsRouteProps {
  me: CollectorProfileSavesAndFollowsRoute_me$data
}

const CollectorProfileSavesAndFollowsRoute: React.FC<CollectorProfileSavesAndFollowsRouteProps> = ({
  me,
}) => {
  const isArtworkListsEnabled = useCheckIfArtworkListsEnabled()

  if (isArtworkListsEnabled) {
    return <CollectorProfileSaves2RouteFragmentContainer me={me} />
  }

  return <CollectorProfileSavesRouteQueryRenderer />
}

export const CollectorProfileSavesAndFollowsRouteFragmentContainer = createFragmentContainer(
  CollectorProfileSavesAndFollowsRoute,
  {
    me: graphql`
      fragment CollectorProfileSavesAndFollowsRoute_me on Me
        @argumentDefinitions(
          shouldFetchArtworkListsData: { type: "Boolean!" }
        ) {
        ...CollectorProfileSaves2Route_me
          @include(if: $shouldFetchArtworkListsData)
      }
    `,
  }
)
