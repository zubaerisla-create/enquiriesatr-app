import React from "react";
import Svg, { Circle, Line, Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

export const ThreatAssessmentIcon: React.FC<IconProps> = ({
  size = 24,
  color = "currentColor",
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Tactical Armor Shield Contour */}
    <Path
      d="M12 2.5L4.5 5.8V11.5C4.5 16.5 7.7 20.8 12 22C16.3 20.8 19.5 16.5 19.5 11.5V5.8L12 2.5Z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Threat Radar Target Scope / Reticle */}
    <Circle
      cx="12"
      cy="12"
      r="3.8"
      stroke={color}
      strokeWidth={1.6}
    />

    {/* Reticle Targeting Crosshairs */}
    <Line
      x1="12"
      y1="6.8"
      x2="12"
      y2="9.2"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
    <Line
      x1="12"
      y1="14.8"
      x2="12"
      y2="17.2"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
    <Line
      x1="6.8"
      y1="12"
      x2="9.2"
      y2="12"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
    <Line
      x1="14.8"
      y1="12"
      x2="17.2"
      y2="12"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
    />

    {/* Center Threat Dot */}
    <Circle
      cx="12"
      cy="12"
      r="1.2"
      fill={color}
    />
  </Svg>
);

export default ThreatAssessmentIcon;
