import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Shield, Lock, User, Fingerprint } from 'lucide-react';

type IconProps = React.SVGProps<SVGSVGElement> & {
  name?: string;
};

const SafeIcon: React.FC<IconProps> = ({ name = 'Circle', ...props }) => {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[name];
  const Fallback = LucideIcons.Circle as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  const RenderIcon = IconComponent || Fallback;
  return <RenderIcon {...props} />;
};

export const SafeFingerprintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Fingerprint {...props} />
);
export const SafeShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Shield {...props} />
);
export const SafeLockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Lock {...props} />
);
export const SafeUserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <User {...props} />
);

export default SafeIcon;
