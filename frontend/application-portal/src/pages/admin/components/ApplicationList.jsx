import { LoaderCircle } from "lucide-react";
import ApplicationCard from "./ApplicationCard";

export default function ApplicationList({
  list,
  loading,
  error,
  selectedId,
  onSelect,
}) {
  if (loading) {
    return (
      <div className="jap-empty-state">
        <LoaderCircle className="jap-spinner" size={20} />
        Loading applications...
      </div>
    );
  }

  if (error) {
    return <div className="jap-empty-state">{error}</div>;
  }

  if (list.length === 0) {
    return <div className="jap-empty-state">No applications found.</div>;
  }

  return (
    <div className="jap-list">
      {list.map((application) => (
        <ApplicationCard
          key={application._id}
          application={application}
          selected={selectedId === application._id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
