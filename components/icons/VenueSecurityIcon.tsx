import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

export const VenueSecurityIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Base perimeter ground line */}
    <Path
      d="M2 21H22"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />

    {/* Venue Architectural Facade / Structure */}
    <Path
      d="M4 21V9.5C4 8.67 4.67 8 5.5 8H18.5C19.33 8 20 8.67 20 9.5V21"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />

    {/* Upper Cornice / Grand Entrance Canopy */}
    <Path
      d="M2 8L12 3L22 8"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Secure Access Portal / Gateway */}
    <Path
      d="M9 21V15C9 14.17 9.67 13.5 10.5 13.5H13.5C14.33 13.5 15 14.17 15 15V21"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />

    {/* Security Checkpoint Beacon / Sensor */}
    <Path
      d="M12 3V1"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />

    {/* Monitoring Window Portals */}
    <Rect
      x="6.5"
      y="11"
      width="2"
      height="2.5"
      rx="0.5"
      stroke={color}
      strokeWidth={1.5}
    />
    <Rect
      x="15.5"
      y="11"
      width="2"
      height="2.5"
      rx="0.5"
      stroke={color}
      strokeWidth={1.5}
    />
  </Svg>
);

export default VenueSecurityIcon;
