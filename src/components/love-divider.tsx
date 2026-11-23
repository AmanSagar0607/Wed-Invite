import { Heart } from "lucide-react";

export function LoveDivider() {
  return (
    <div className="family-love-divider" aria-hidden="true">
      <span />
      <Heart size={18} fill="currentColor" strokeWidth={1.5} />
      <span />
    </div>
  );
}
