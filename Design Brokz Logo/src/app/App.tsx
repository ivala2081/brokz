import { BrokzLogo, BrokzLogoCompact, BrokzIcon } from "@/app/components/BrokzLogo";

export default function App() {
  return (
    <div className="size-full flex items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-16 p-8">
        {/* Main logo with tagline */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-sm font-medium text-neutral-600 uppercase tracking-wider">Full Logo</h2>
          <BrokzLogo size={200} />
        </div>

        {/* Compact version */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-sm font-medium text-neutral-600 uppercase tracking-wider">Compact Logo</h2>
          <BrokzLogoCompact size={150} />
        </div>

        {/* Icon only */}
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-sm font-medium text-neutral-600 uppercase tracking-wider">Icon Only</h2>
          <BrokzIcon size={100} />
        </div>
      </div>
    </div>
  );
}