import React from "react";
import Svg, { Circle, Line, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

export const GuardianAIIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Guardian Protective Shield Armor Contour */}
    <Path
      d="M12 2.5L4.5 5.8V11.5C4.5 16.5 7.7 20.8 12 22C16.3 20.8 19.5 16.5 19.5 11.5V5.8L12 2.5Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* AI Quantum Neural Sparkle Core (Center) */}
    <Path
      d="M12 7.2C12 9.4 13.3 10.9 15.2 11.5C13.3 12.1 12 13.6 12 15.8C12 13.6 10.7 12.1 8.8 11.5C10.7 10.9 12 9.4 12 7.2Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Center AI Nucleus */}
    <Circle
      cx="12"
      cy="11.5"
      r="1.2"
      fill={color}
    />

    {/* Neural Pulse Satellite / Secondary AI Spark */}
    <Path
      d="M16 6C16 6.8 16.5 7.4 17.2 7.7C16.5 8 16 8.6 16 9.4C16 8.6 15.5 8 14.8 7.7C15.5 7.4 16 6.8 16 6Z"
      fill={color}
    />

    {/* Neural Synapse Circuit Node (Bottom Anchor) */}
    <Line
      x1="12"
      y1="16.5"
      x2="12"
      y2="18.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Circle
      cx="12"
      cy="19"
      r="0.8"
      fill={color}
    />
  </Svg>
);

export default GuardianAIIcon;
