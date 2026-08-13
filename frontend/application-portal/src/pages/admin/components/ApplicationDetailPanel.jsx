import ApplicantProfileCard from "./ApplicantProfileCard";
import ApplicantNoteBar from "./ApplicantNoteBar";
import ContactDetailsCard from "./ContactDetailsCard";
import ApplicationReviewCard from "./ApplicationReviewCard";

export default function ApplicationDetailPanel({
  application,
  isUpdating,
  onViewResume,
  onViewAdditionalDoc,
  onAccept,
  onDecline,
}) {
  return (
    <section className="jap-detail-panel">
      <ApplicantProfileCard application={application} />
      <ApplicantNoteBar />
      <ContactDetailsCard application={application} />
      <ApplicationReviewCard
        application={application}
        isUpdating={isUpdating}
        onViewResume={onViewResume}
        onViewAdditionalDoc={onViewAdditionalDoc}
        onAccept={onAccept}
        onDecline={onDecline}
      />
    </section>
  );
}
