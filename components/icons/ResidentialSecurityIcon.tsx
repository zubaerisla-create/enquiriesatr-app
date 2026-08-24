import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

export const ResidentialSecurityIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Residential Roof Pitch & Chimney / Surveillance Mast */}
    <Path
      d="M2.5 10.5L12 3L21.5 10.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18 6.5V3.5H16V5"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Residence Perimeter Walls */}
    <Path
      d="M4.5 9.5V20C4.5 20.55 4.95 21 5.5 21H18.5C19.05 21 19.5 20.55 19.5 20V9.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />

    {/* Center Protective Shield / Close Protection Badge */}
    <Path
      d="M12 11.5L9 13V15.5C9 17.5 10.3 19.3 12 20C13.7 19.3 15 17.5 15 15.5V13L12 11.5Z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Shield Core Sentinel Dot */}
    <Circle
      cx="12"
      cy="15.5"
      r="1"
      fill={color}
    />
  </Svg>
);

export default ResidentialSecurityIcon;
