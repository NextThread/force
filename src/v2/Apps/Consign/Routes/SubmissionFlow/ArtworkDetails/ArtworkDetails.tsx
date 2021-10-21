import { Button, Text } from "@artsy/palette"
import { SubmissionStepper } from "v2/Apps/Consign/Components/SubmissionStepper"
import { Form, Formik } from "formik"
import {
  ArtworkDetailsForm,
  ArtworkDetailsFormModel,
} from "./Components/ArtworkDetailsForm"
import { useRouter } from "v2/System/Router/useRouter"
import uuid from "uuid"
import { useSubmission } from "../Utils/useSubmission"
import { artworkDetailsValidationSchema } from "../Utils/validation"
import { BackLink } from "v2/Components/Links/BackLink"

export const initialValues = {
  artistId: "",
  artistName: "",
  year: "",
  title: "",
  medium: "",
  rarity: "",
  editionNumber: "",
  editionSize: undefined,
  height: "",
  width: "",
  depth: "",
  units: "in",
}

export const ArtworkDetails: React.FC = () => {
  const {
    router,
    match: {
      params: { id },
    },
  } = useRouter()
  const { submission, saveSubmission, submissionId } = useSubmission(
    id ? id : uuid()
  )

  const handleSubmit = (values: ArtworkDetailsFormModel) => {
    const isLimitedEditionRarity = values.rarity === "limited edition"

    const artworkDetailsForm = {
      ...values,
      editionNumber: isLimitedEditionRarity ? values.editionNumber : "",
      editionSize: isLimitedEditionRarity ? values.editionSize : undefined,
    }

    saveSubmission(
      submission
        ? {
            ...submission,
            artworkDetailsForm,
          }
        : { artworkDetailsForm }
    )

    router.replace({
      pathname: `/consign/submission2/${submissionId}/artwork-details`,
    })
    router.push({
      pathname: `/consign/submission2/${submissionId}/upload-photos`,
    })
  }

  return (
    <>
      <BackLink py={2} mb={6} to="/consign">
        Back ....
      </BackLink>

      <SubmissionStepper currentStep="Artwork Details" />

      <Text mt={4} mb={1} variant="lg">
        Tell us about your artwork
      </Text>
      <Text mb={[2, 6]} variant="sm" color="black60">
        All fields are required to submit a work.
      </Text>

      <Formik<ArtworkDetailsFormModel>
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={artworkDetailsValidationSchema}
        validateOnMount
      >
        {({ isSubmitting, isValid }) => (
          <Form>
            <ArtworkDetailsForm />
            <Button
              mt={6}
              data-test-id="save-button"
              type="submit"
              size="medium"
              variant="primaryBlack"
              loading={isSubmitting}
              disabled={!isValid}
            >
              Save and Continue
            </Button>
          </Form>
        )}
      </Formik>
    </>
  )
}
