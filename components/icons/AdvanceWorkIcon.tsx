import React from "react";
import Svg, { Circle, Line, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

export const AdvanceWorkIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* 3-Panel Tactical Folded Recce Map Base */}
    <Path
      d="M3 6L9 3L15 6L21 3V18L15 21L9 18L3 21V6Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Map Fold Lines */}
    <Line
      x1="9"
      y1="3"
      x2="9"
      y2="18"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Line
      x1="15"
      y1="6"
      x2="15"
      y2="21"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />

    {/* Reconnaissance Route Path */}
    <Path
      d="M6 14C7.5 12.5 8.5 13 10 11.5"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeDasharray="1.5 1.5"
    />

    {/* Advance Target Waypoint Pin */}
    <Path
      d="M14.5 9C14.5 7.62 13.38 6.5 12 6.5C10.62 6.5 9.5 7.62 9.5 9C9.5 11 12 13.5 12 13.5C12 13.5 14.5 11 14.5 9Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle
      cx="12"
      cy="9"
      r="0.9"
      fill={color}
    />
  </Svg>
);

export default AdvanceWorkIcon;
