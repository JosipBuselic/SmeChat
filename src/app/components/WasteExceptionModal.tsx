import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { getWasteException, type WasteCategory } from "../utils/wasteData";
import { cn } from "./ui/utils";

type WasteExceptionModalProps = {
  category: WasteCategory;
  open: boolean;
  onAcknowledge: () => void;
};

export function WasteExceptionModal({
  category,
  open,
  onAcknowledge,
}: WasteExceptionModalProps) {
  const info = getWasteException(category.id);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) return;
      }}
    >
      <AlertDialogContent
        className={cn(
          "max-w-md gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-lg sm:max-w-md",
        )}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <AlertDialogHeader className="space-y-3 text-left">
          <p className="text-sm text-gray-500">
            {category.icon} <span className="font-medium text-gray-800">{category.name}</span>
          </p>
          <AlertDialogTitle className="text-xl font-bold text-gray-900">
            {info.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left text-sm leading-relaxed text-gray-600">
            {info.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-stretch">
          <AlertDialogAction
            className={cn(
              "w-full rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 py-4 text-base font-bold text-white shadow-lg",
              "hover:opacity-95 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2",
            )}
            onClick={onAcknowledge}
          >
            Razumijem
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
