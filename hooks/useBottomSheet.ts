import { useRef, useCallback, useState } from "react";
import { AppBottomSheetRef } from "../components/ui/BottomSheet";

export function useBottomSheet() {
  const ref = useRef<AppBottomSheetRef>(null);
  const [isOpen, setIsOpen] = useState(false);

  const present = useCallback(() => {
    setIsOpen(true);
    ref.current?.present();
  }, []);

  const dismiss = useCallback(() => {
    setIsOpen(false);
    ref.current?.dismiss();
  }, []);

  return {
    ref,
    isOpen,
    present,
    dismiss,
  };
}
