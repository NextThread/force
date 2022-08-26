import {
  ArtsyLogoBlackIcon,
  Button,
  DROP_SHADOW,
  Flex,
  FullBleed,
  Spacer,
  Step,
  Stepper,
  useToasts,
} from "@artsy/palette"
import { AppContainer } from "Apps/Components/AppContainer"
import { HorizontalPadding } from "Apps/Components/HorizontalPadding"
import { BackLink } from "Components/Links/BackLink"
import { MetaTags } from "Components/MetaTags"
import { Sticky, StickyProvider } from "Components/Sticky"
import { Form, Formik } from "formik"
import { useState } from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { RouterLink } from "System/Router/RouterLink"
import { useRouter } from "System/Router/useRouter"
import createLogger from "Utils/logger"
import { MyCollectionArtworkForm_artwork } from "__generated__/MyCollectionArtworkForm_artwork.graphql"
import { ArtworkAttributionClassType } from "__generated__/useCreateArtworkMutation.graphql"
import { MyCollectionArtworkFormDetails } from "./Components/MyCollectionArtworkFormDetails"
import { MyCollectionArtworkFormImages } from "./Components/MyCollectionArtworkFormImages"
import { ConfirmationModalBack } from "./ConfirmationModalBack"
import { ConfirmationModalDelete } from "./ConfirmationModalDelete"
import { useDeleteArtwork } from "./Mutations/useDeleteArtwork"
import { useDeleteArtworkImage } from "./Mutations/useDeleteArtworkImage"
import { getMyCollectionArtworkFormInitialValues } from "./Utils/artworkFormHelpers"
import { ArtworkModel } from "./Utils/artworkModel"
import {
  MyCollectionArtworkDetailsValidationSchema,
  validateArtwork,
} from "./Utils/artworkValidation"
import { useCreateOrUpdateArtwork } from "./Utils/useCreateOrUpdateArtwork"

const logger = createLogger("MyCollectionArtworkForm.tsx")

export interface MyCollectionArtworkFormProps {
  artwork?: MyCollectionArtworkForm_artwork
}

export const MyCollectionArtworkForm: React.FC<MyCollectionArtworkFormProps> = ({
  artwork,
}) => {
  const { router } = useRouter()
  const { sendToast } = useToasts()
  const initialValues = getMyCollectionArtworkFormInitialValues(artwork)
  const initialErrors = validateArtwork(
    initialValues,
    MyCollectionArtworkDetailsValidationSchema
  )

  const [shouldShowBackModal, setShouldShowBackModal] = useState<boolean>(false)
  const [shouldShowDeletionModal, setShouldShowDeletionModal] = useState<
    boolean
  >(false)
  const { createOrUpdateArtwork } = useCreateOrUpdateArtwork()
  const { submitMutation: deleteArtworkImage } = useDeleteArtworkImage()
  const { submitMutation: deleteArtwork } = useDeleteArtwork()

  const isEditing = !!artwork?.internalID

  const handleSubmit = async (values: ArtworkModel) => {
    // Set edition values for attribution class

    if (values.attributionClass !== "LIMITED_EDITION") {
      values.editionNumber = ""
      values.editionSize = ""
    }

    // Create or update artwork

    try {
      const artworkId = await createOrUpdateArtwork({
        artworkId: artwork?.internalID,
        artistIds: [values.artistId],
        category: values.category,
        date: values.date,
        title: values.title,
        medium: values.medium,
        attributionClass: values.attributionClass
          ?.replace(" ", "_")
          ?.toUpperCase() as ArtworkAttributionClassType,
        editionNumber: values.editionNumber,
        editionSize: values.editionSize,
        height: values.height,
        width: values.width,
        depth: values.depth,
        metric: values.metric,
        externalImageUrls: values.newPhotos.flatMap(photo => photo.url || null),
        pricePaidCents:
          !values.pricePaidDollars || isNaN(Number(values.pricePaidDollars))
            ? undefined
            : Number(values.pricePaidDollars) * 100,
        pricePaidCurrency: values.pricePaidCurrency,
        provenance: values.provenance,
        artworkLocation: values.artworkLocation,
      })

      // Remove photos marked for deletion

      const removedPhotos = values.photos.filter(photo => photo.removed)

      await Promise.all(
        removedPhotos.map(async photo => {
          try {
            await deleteArtworkImage({
              variables: {
                input: {
                  artworkID: artwork?.internalID!,
                  imageID: photo.internalID!,
                },
              },
            })
          } catch (error) {
            logger.error("An error occured while removing images.", error)

            sendToast({
              variant: "error",
              message: "An error occurred",
              description: "Couldn't remove all images.",
            })
          }
        })
      )

      if (isEditing) {
        router.push({ pathname: `/my-collection/artwork/${artworkId}` })
      } else {
        router.replace({
          pathname: `/my-collection/artworks/${artworkId}/edit`,
        })
        router.push({ pathname: "/settings/my-collection" })
      }
    } catch (error) {
      logger.error(
        `Artwork not ${artwork?.internalID ? "updated" : "created"}`,
        error
      )

      sendToast({
        variant: "error",
        message: "An error occurred",
        description: "Please contact support@artsymail.com",
      })

      return
    }
  }

  const handleDelete = async () => {
    try {
      await deleteArtwork({
        variables: {
          input: { artworkId: artwork?.internalID! },
        },
        rejectIf: res => {
          return res.myCollectionDeleteArtwork?.artworkOrError?.mutationError
        },
      })
      router.push({ pathname: "/settings/my-collection" })
    } catch (error) {
      logger.error(`Artwork not deleted`, error)

      sendToast({
        variant: "error",
        message: "An error occurred",
        description: "Please contact support@artsymail.com",
      })

      return
    }
  }

  return (
    <>
      <MetaTags
        title={
          artwork
            ? `Edit ${artwork.title} - ${artwork.artistNames} | Artsy`
            : "Upload Artwork | Artsy"
        }
      />

      <Spacer mt={4} />

      <AppContainer>
        <Formik<ArtworkModel>
          validateOnMount
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={MyCollectionArtworkDetailsValidationSchema}
          initialErrors={initialErrors}
        >
          {({ isSubmitting, isValid }) => (
            <Form>
              <RouterLink to="/my-collection" display="block">
                <ArtsyLogoBlackIcon display="block" />
              </RouterLink>

              <StickyProvider>
                {shouldShowBackModal && (
                  <ConfirmationModalBack
                    onClose={() => setShouldShowBackModal(false)}
                    isEditing={isEditing}
                    handleSubmit={
                      isEditing
                        ? `/my-collection/artwork/${artwork.internalID}`
                        : "/my-collection"
                    }
                  />
                )}
                {shouldShowDeletionModal && (
                  <ConfirmationModalDelete
                    onClose={() => setShouldShowDeletionModal(false)}
                    handleDelete={handleDelete}
                  />
                )}
                <Sticky withoutHeaderOffset>
                  {({ stuck }) => {
                    return (
                      <FullBleed
                        backgroundColor="white100"
                        style={stuck ? { boxShadow: DROP_SHADOW } : undefined}
                      >
                        <AppContainer>
                          <HorizontalPadding>
                            <Flex
                              flexDirection="row"
                              justifyContent="space-between"
                              py={2}
                            >
                              <BackLink
                                // @ts-ignore
                                as={RouterLink}
                                onClick={() => setShouldShowBackModal(true)}
                                width="min-content"
                              >
                                Back
                              </BackLink>

                              <Button
                                width={[120, 300]}
                                data-testid="save-button"
                                type="submit"
                                size={["small", "large"]}
                                variant="primaryBlack"
                                loading={isSubmitting}
                                disabled={!isValid}
                              >
                                {isEditing ? "Save Artwork" : "Upload Artwork"}
                              </Button>
                            </Flex>
                          </HorizontalPadding>
                        </AppContainer>
                      </FullBleed>
                    )
                  }}
                </Sticky>
              </StickyProvider>

              <Stepper
                initialTabIndex={0}
                currentStepIndex={0}
                disableNavigation
              >
                <Step name="Add Artwork Details" />
              </Stepper>

              <Spacer mb={4} />

              <MyCollectionArtworkFormDetails />

              <Spacer mb={4} />

              <MyCollectionArtworkFormImages />
            </Form>
          )}
        </Formik>

        <Spacer mt={4} />

        {isEditing && (
          <Button
            onClick={() => setShouldShowDeletionModal(true)}
            width={["100%", "auto"]}
            variant="secondaryNeutral"
            data-testid="delete-button"
          >
            Delete Artwork
          </Button>
        )}
      </AppContainer>

      <Spacer mt={4} />
    </>
  )
}

export const MyCollectionArtworkFormFragmentContainer = createFragmentContainer(
  MyCollectionArtworkForm,
  {
    artwork: graphql`
      fragment MyCollectionArtworkForm_artwork on Artwork {
        artist {
          internalID
          name
          formattedNationalityAndBirthday
          targetSupply {
            isP1
          }
        }
        consignmentSubmission {
          inProgress
        }
        artistNames
        category
        pricePaid {
          display
          minor
          currencyCode
        }
        date
        depth
        dimensions {
          in
          cm
        }
        editionSize
        editionNumber
        height
        attributionClass {
          name
        }
        id
        images {
          internalID
          isDefault
          imageURL
          width
          height
          internalID
        }
        internalID
        isEdition
        medium
        metric
        artworkLocation
        provenance
        slug
        title
        width
      }
    `,
  }
)