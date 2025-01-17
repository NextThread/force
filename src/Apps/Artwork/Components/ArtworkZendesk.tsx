import { FC, useMemo } from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { ZendeskWrapper } from "Components/ZendeskWrapper"
import { exceedsChatSupportThreshold } from "Utils/exceedsChatSupportThreshold"
import { ArtworkZendesk_artwork$data } from "__generated__/ArtworkZendesk_artwork.graphql"
import { getENV } from "Utils/getENV"
import { SalesforceWrapper } from "Components/SalesforceWrapper"
import { Media } from "Utils/Responsive"

interface ArtworkZendeskProps {
  artwork: ArtworkZendesk_artwork$data
}

const ArtworkZendesk: FC<ArtworkZendeskProps> = ({ artwork }) => {
  const {
    isAcquireable,
    isInquireable,
    isOfferable,
    listPrice,
    isInAuction,
  } = artwork

  const price = useMemo(() => {
    if (!listPrice) return null

    switch (listPrice.__typename) {
      case "Money":
        return listPrice
      case "PriceRange":
        return listPrice.maxPrice
      default:
        return null
    }
  }, [listPrice])

  // Don't display on inquiry artworks
  if (isInquireable && !isAcquireable && !isOfferable) return null

  if (!price || !exceedsChatSupportThreshold(price.major, price.currencyCode)) {
    return null
  }

  return getENV("SALESFORCE_CHAT_ENABLED") ? (
    <Media greaterThan="xs">
      <SalesforceWrapper />
    </Media>
  ) : (
    <ZendeskWrapper mode={isInAuction ? "auction" : "default"} />
  )
}

export const ArtworkZendeskFragmentContainer = createFragmentContainer(
  ArtworkZendesk,
  {
    artwork: graphql`
      fragment ArtworkZendesk_artwork on Artwork {
        isAcquireable
        isInquireable
        isOfferable
        isInAuction
        listPrice {
          __typename
          ... on Money {
            currencyCode
            major
          }
          ... on PriceRange {
            maxPrice {
              currencyCode
              major
            }
          }
        }
      }
    `,
  }
)
