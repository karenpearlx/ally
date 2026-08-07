type Position = 'center' | 'left' | 'right' | 'bottom' | 'bottom-left' | 'bottom-right';

const POSITIONS: Record<Position, string> = {
  center: '50% 50%',
  left: '0% 50%',
  right: '100% 50%',
  bottom: '50% 100%',
  'bottom-left': '0% 100%',
  'bottom-right': '100% 100%',
};

export default function GradientBg({ position = 'center' }: { position?: Position }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background: `radial-gradient(ellipse 60% 38% at ${POSITIONS[position]}, rgba(13, 155, 138, 0.20), transparent)`,
      }}
    />
  );
}
