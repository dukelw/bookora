export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("guestId");
  if (!id) {
    if (crypto && "randomUUID" in crypto) id = crypto.randomUUID();
    else id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem("guestId", id);
  }
  return id;
}

export function clearGuestId() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("guestId");
}
