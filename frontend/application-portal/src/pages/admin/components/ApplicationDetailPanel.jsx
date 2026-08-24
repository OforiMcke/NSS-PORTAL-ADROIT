import ApplicantProfileCard from "./ApplicantProfileCard";
import ContactDetailsCard from "./ContactDetailsCard";
import ApplicationReviewCard from "./ApplicationReviewCard";

export default function ApplicationDetailPanel({
  application,
  isUpdating,
  // onViewResume,
  // onViewAdditionalDoc,
  onAccept,
  onDecline,
  onReset,
}) {
  return (
    <section className="jap-detail-panel">
      <ApplicantProfileCard
        application={application}
        isUpdating={isUpdating}
        onAccept={onAccept}
        onDecline={onDecline}
        onReset={onReset}
      />
      <ContactDetailsCard application={application} />
      <ApplicationReviewCard
        application={application}
        isUpdating={isUpdating}
        // onViewResume={onViewResume}
        // onViewAdditionalDoc={onViewAdditionalDoc}
      />
    </section>
  );
}
