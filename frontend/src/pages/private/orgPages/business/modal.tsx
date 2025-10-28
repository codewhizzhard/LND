// components/ui/CustomDialog.tsx
import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CustomDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  zIndex?: number;
}

export const CustomDialog = ({
  open,
  title,
  description,
  onOpenChange,
  children,
  size = "md",
  zIndex
}: CustomDialogProps) => {
  let widthClass = "sm:max-w-md"; // default md
  if (size === "sm") widthClass = "sm:max-w-sm";
  if (size === "lg") widthClass = "sm:max-w-lg";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`bg-white rounded-lg shadow-lg ${widthClass} z-${zIndex}`} >
        <DialogHeader className="flex justify-between items-center border-b px-1">
          <DialogTitle className="text-lg font-semibold text-gray-800">{title}</DialogTitle>
          <Button variant="ghost" size="sm" className="p-1" onClick={() => onOpenChange(false)}>
           {/*  <X className="w-5 h-2 text-gray-600" /> */}
          </Button>
        </DialogHeader>
        {description && (
          <DialogDescription className="px-1 pt-1 text-sm text-gray-600">{description}</DialogDescription>
        )}
        <div className="px-1 py-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
};
