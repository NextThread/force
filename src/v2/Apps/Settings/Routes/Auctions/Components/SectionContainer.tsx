import { Text, GridColumns } from "@artsy/palette"
import React from "react"

export const SectionContainer = ({ children, title }) => {
  const hasChildren = !!React.Children.count(children)

  return (
    <>
      <Text variant={["sm", "lg"]} mt={4} mb={[2, 4]}>
        {title}
      </Text>
      {hasChildren ? (
        <GridColumns mb={6}>{children}</GridColumns>
      ) : (
        <Text mb={4} color="black60" variant="sm">
          Nothing to Show
        </Text>
      )}
    </>
  )
}
