export function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function statusLabel(status) {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "declined":
      return "Declined";
    default:
      return "Pending";
  }
}
