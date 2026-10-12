import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AppModal = ({
  show,
  onClose,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isLoading = false,
  showFooter = true,
  children,
  title,
}) => {
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Lengkapi data di bawah ini dengan benar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <div className="py-2">{children}</div>

          {showFooter && (
            <DialogFooter className="flex gap-2 mt-6 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onClose(false)}
                className="rounded-md hover:"
              >
                {cancelLabel}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-md hover:shadow-md bg-primary hover:bg-primary/90"
              >
                {isLoading ? "Loading..." : submitLabel}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppModal;
