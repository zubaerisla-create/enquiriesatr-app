// import React from "react";
// import Animated, { Keyframe } from "react-native-reanimated";

// export const customSlideIn = new Keyframe({
//   from: {
//     opacity: 0,
//     transform: [{ translateX: 50 }],
//   },
//   to: {
//     opacity: 1,
//     transform: [{ translateX: 0 }],
//   },
// }).duration(200);

// export default function AnimatedPage({ children }: { children: React.ReactNode }) {
//   return (
//     <Animated.View entering={customSlideIn} className="flex-1">
//       {children}
//     </Animated.View>
//   );
// }


import React from "react";
import Animated, { Keyframe, Easing } from "react-native-reanimated";

export const customSlideIn = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ translateX: 50 }],
  },
  100: {
    opacity: 1,
    transform: [{ translateX: 0 }],
    easing: Easing.out(Easing.exp),
  },
}).duration(250);

export const customSlideOut = new Keyframe({
  0: {
    opacity: 1,
    transform: [{ translateX: 0 }],
  },
  100: {
    opacity: 0,
    transform: [{ translateX: 50 }],
    easing: Easing.in(Easing.ease),
  },
}).duration(200);

export default function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <Animated.View
      entering={customSlideIn}
      exiting={customSlideOut}
      className="flex-1"
    >
      {children}
    </Animated.View>
  );
}