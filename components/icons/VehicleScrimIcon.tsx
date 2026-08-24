import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

export const VehicleScrimIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* SCRIM Optical Identification HUD Brackets */}
    <Path
      d="M2 7V4C2 3.45 2.45 3 3 3H6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path
      d="M18 3H21C21.55 3 22 3.45 22 4V7"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path
      d="M2 17V20C2 20.55 2.45 21 3 21H6"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path
      d="M18 21H21C21.55 21 22 20.55 22 20V17"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />

    {/* Vehicle Cabin & Windshield Line */}
    <Path
      d="M6 12L8 7.5H16L18 12"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Vehicle Chassis Body */}
    <Path
      d="M4.5 12H19.5C20.33 12 21 12.67 21 13.5V16.5C21 17.05 20.55 17.5 20 17.5H18.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path
      d="M14.5 17.5H9.5"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Path
      d="M5.5 17.5H4C3.45 17.5 3 17.05 3 16.5V13.5C3 12.67 3.67 12 4.5 12Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />

    {/* Wheels / Ground Contact */}
    <Circle
      cx="7.5"
      cy="17.5"
      r="2"
      stroke={color}
      strokeWidth={1.8}
    />
    <Circle
      cx="16.5"
      cy="17.5"
      r="2"
      stroke={color}
      strokeWidth={1.8}
    />

    {/* Identification Laser Scanner Beam (SCRIM Detection) */}
    <Path
      d="M9.5 5H14.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export default VehicleScrimIcon;
