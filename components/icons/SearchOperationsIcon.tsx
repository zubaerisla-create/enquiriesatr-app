import React from "react";
import Svg, { Circle, Line, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

export const SearchOperationsIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Tactical corner brackets (Viewfinder / Scan grid) */}
    <Path
      d="M3 7V4.5C3 3.67 3.67 3 4.5 3H7"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path
      d="M17 3H19.5C20.33 3 21 3.67 21 4.5V7"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path
      d="M3 17V19.5C3 20.33 3.67 21 4.5 21H7"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path
      d="M17 21H19.5C20.33 21 21 20.33 21 19.5V17"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />

    {/* Precision Search Lens */}
    <Circle
      cx="11"
      cy="11"
      r="4"
      stroke={color}
      strokeWidth={1.8}
    />

    {/* Optic Handle */}
    <Path
      d="M14 14L18 18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />

    {/* Tactical Central Reticle Cross */}
    <Line
      x1="11"
      y1="9.5"
      x2="11"
      y2="12.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Line
      x1="9.5"
      y1="11"
      x2="12.5"
      y2="11"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export default SearchOperationsIcon;
