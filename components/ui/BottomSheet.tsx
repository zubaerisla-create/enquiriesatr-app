import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetModal,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import { X } from "lucide-react-native";
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { rf, rs } from "../../utils/responsive";

export interface AppBottomSheetProps {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  enableDynamicSizing?: boolean;
  title?: string;
  subtitle?: string;
  onDismiss?: () => void;
  enablePanDownToClose?: boolean;
  showCloseButton?: boolean;
  variant?: "dark" | "light";
  keyboardBehavior?: "interactive" | "extend" | "fillParent";
  keyboardBlurBehavior?: "none" | "restore";
  animationConfigs?: any;
}

export interface AppBottomSheetRef {
  present: () => void;
  dismiss: () => void;
  snapToIndex: (index: number) => void;
}

const AppBottomSheet = forwardRef<AppBottomSheetRef, AppBottomSheetProps>(
  (
    {
      children,
      snapPoints,
      enableDynamicSizing = true,
      title,
      subtitle,
      onDismiss,
      enablePanDownToClose = true,
      showCloseButton = true,
      variant = "dark",
      keyboardBehavior = "interactive",
      keyboardBlurBehavior = "restore",
      animationConfigs,
    },
    ref
  ) => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const { dismiss: dismissAll } = useBottomSheetModal();

    const defaultAnimationConfigs = useBottomSheetSpringConfigs({
      damping: 100,
      overshootClamping: true,
      stiffness: 1000,
    });

    const combinedAnimationConfigs = useMemo(() => {
      return animationConfigs || defaultAnimationConfigs;
    }, [animationConfigs, defaultAnimationConfigs]);

    useImperativeHandle(ref, () => ({
      present: () => {
        sheetRef.current?.present();
      },
      dismiss: () => {
        sheetRef.current?.dismiss();
      },
      snapToIndex: (index: number) => {
        sheetRef.current?.snapToIndex(index);
      },
    }));

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.6}
          pressBehavior="close"
        />
      ),
      []
    );

    const isDark = variant === "dark";

    const backgroundStyle = {
      backgroundColor: isDark ? "#030712" : "#ffffff",
      borderTopWidth: 1,
      borderColor: isDark ? "#1F2937" : "#E5E7EB",
    };

    const handleStyle = {
      backgroundColor: isDark ? "#374151" : "#D1D5DB",
    };

    const handleDismiss = () => {
      dismissAll();
      if (onDismiss) {
        onDismiss();
      }
    };

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={backgroundStyle}
        handleIndicatorStyle={handleStyle}
        onDismiss={handleDismiss}
        keyboardBehavior={keyboardBehavior}
        keyboardBlurBehavior={keyboardBlurBehavior}
        android_keyboardInputMode="adjustResize"
        animationConfigs={combinedAnimationConfigs}
      >
        <BottomSheetView style={styles.container}>
          {(title || subtitle || showCloseButton) && (
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                {title && (
                  <Text
                    style={[
                      styles.title,
                      { color: isDark ? "#ffffff" : "#131C2E" },
                    ]}
                  >
                    {title}
                  </Text>
                )}
                {subtitle && (
                  <Text
                    style={[
                      styles.subtitle,
                      { color: isDark ? "#9CA3AF" : "#6B7280" },
                    ]}
                  >
                    {subtitle}
                  </Text>
                )}
              </View>
              {showCloseButton && (
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: isDark ? "#111827" : "#F3F4F6",
                      borderColor: isDark ? "#1F2937" : "#E5E7EB",
                    },
                  ]}
                >
                  <X size={rs(16)} color={isDark ? "#9CA3AF" : "#6B7280"} />
                </TouchableOpacity>
              )}
            </View>
          )}
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

AppBottomSheet.displayName = "AppBottomSheet";

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: rs(20),
    paddingBottom: rs(36),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: rs(20),
    paddingTop: rs(8),
  },
  titleContainer: {
    flex: 1,
    paddingRight: rs(12),
  },
  title: {
    fontSize: rf(20),
    fontWeight: "800",
  },
  subtitle: {
    fontSize: rf(12),
    marginTop: rs(2),
  },
  closeButton: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AppBottomSheet;
