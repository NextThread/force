import { Column, Flex, Text } from "@artsy/palette"
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { RouterLink } from "v2/System/Router/RouterLink"
import { SectionContainer } from "./SectionContainer"
import { UserBidHistory_me } from "v2/__generated__/UserBidHistory_me.graphql"

interface UserBidHistoryProps {
  me: UserBidHistory_me
}

export const UserBidHistory: React.FC<UserBidHistoryProps> = ({ me }) => {
  if (!me?.myBids?.closed) {
    return null
  }

  return (
    <SectionContainer title="Bid History">
      {me.myBids.closed.map((bid, i) => {
        if (!bid?.sale) {
          return null
        }

        return (
          <Column key={i} span={8} pb={2} display="flex">
            <Flex flexDirection="column">
              <RouterLink to={bid.sale.href ?? ""}>
                <Text color="black80" variant="sm">
                  {bid.sale.name ?? ""}
                </Text>
              </RouterLink>

              <Text color="black60" variant="xs">
                {bid.sale.profile?.bio ?? ""}
              </Text>

              <Text color="black60" variant="xs">
                Ended at: {bid.sale.endAt ?? ""}
              </Text>
            </Flex>
          </Column>
        )
      })}
    </SectionContainer>
  )
}

export const UserBidHistoryFragmentContainer = createFragmentContainer(
  UserBidHistory,
  {
    me: graphql`
      fragment UserBidHistory_me on Me {
        myBids {
          closed {
            sale {
              name
              href
              endAt(format: "MMMM D, h:mmA")
              profile {
                bio
              }
            }
          }
        }
      }
    `,
  }
)
