import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

export function InstagramDisconnectDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Account disconnection is not available yet</DialogTitle>
      <DialogContent>
        <p className="text-sm leading-6 text-[var(--app-muted)]">
          The backend currently does not expose a disconnect or delete route for Instagram accounts. CreatorIQ cannot safely disconnect an account from the frontend alone because the backend connection remains the source of truth.
        </p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}
