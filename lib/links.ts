/** Opens a new Gmail compose window addressed to `email` (like the WhatsApp shortcut). */
export function gmailLink(email: string, subject = 'Hello Sathwik') {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;
}
