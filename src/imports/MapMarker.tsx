import { useMemo, memo, type ReactNode, type ReactElement, type FC, type ImgHTMLAttributes } from 'react';

interface MapMarkerProps {
  color: string;
  size?: number;
  isSelected?: boolean;
  isNearby?: boolean;
}

/**
 * Creates an optimized SVG data URL for map markers
 * Supports premium styling with glow effects
 */
export function createMarkerUrl(
  color: string,
  size: number = 36,
  isSelected: boolean = false,
  isNearby: boolean = false
): string {
  const primaryColor = isNearby ? '#ff9800' : color;
  const glowSize = isSelected ? 8 : 0; // number (stdDeviation expects a number)

  const svg = `<?xml version="1.0"?><svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 24 24'>
    <defs>
      <filter id='glow'>
        <feGaussianBlur stdDeviation='${glowSize}' result='coloredBlur'/>
        <feMerge>
          <feMergeNode in='coloredBlur'/>
          <feMergeNode in='SourceGraphic'/>
        </feMerge>
      </filter>
      <radialGradient id='grad' cx='40%' cy='40%'>
        <stop offset='0%' style='stop-color:${primaryColor};stop-opacity:1' />
        <stop offset='100%' style='stop-color:${primaryColor};stop-opacity:0.8' />
      </radialGradient>
    </defs>
    <circle cx='12' cy='12' r='11' fill='url(#grad)' filter='url(#glow)' opacity='0.9'/>
    <path fill='white' d='M12 2C8 2 5 5 5 9c0 5 6 11 6 11s6-6 6-11c0-4-3-7-7-7z' opacity='0.95'/>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * MarkerProvider - render-prop component that supplies a memoized marker URL to children
 * Usage:
 * <MarkerProvider color="#ff9800">{({url}) => <SomeComponent src={url} />}</MarkerProvider>
 */
type MarkerProviderChildren = (value: { url: string }) => ReactNode;

type MarkerProviderProps = MapMarkerProps & { children?: MarkerProviderChildren };

export const MarkerProvider = memo(function MarkerProvider({ color, size = 36, isSelected = false, isNearby = false, children }: MarkerProviderProps) {
  const markerUrl = useMemo(() => createMarkerUrl(color, size, isSelected, isNearby), [color, size, isSelected, isNearby]);

  return (children ? children({ url: markerUrl }) : null) as ReactElement | null;
});

MarkerProvider.displayName = 'MarkerProvider';

/**
 * Default MapMarker component - lightweight <img> that renders the generated SVG URL
 * Exported as default for convenience when a simple DOM marker is needed
 */
const MapMarker: FC<ImgHTMLAttributes<HTMLImageElement> & MapMarkerProps> = ({
  color,
  size = 36,
  isSelected = false,
  isNearby = false,
  alt = 'map-marker',
  ...rest
}) => {
  const url = useMemo(() => createMarkerUrl(color, size, isSelected, isNearby), [
    color,
    size,
    isSelected,
    isNearby,
  ]);

  return <img src={url} width={size} height={size} alt={alt} {...(rest as any)} />;
};

MapMarker.displayName = 'MapMarker';

export default MapMarker;

