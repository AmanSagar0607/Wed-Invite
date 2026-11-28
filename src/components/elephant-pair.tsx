import Image from "next/image";

export function ElephantPair() {
  return (
    <div className="countdown-elephants" aria-hidden="true">
      <Image
        src="/wedding/elephant-pair-v2.webp"
        alt=""
        width={1376}
        height={768}
        sizes="(max-width: 640px) 92vw, (max-width: 1100px) 62vw, 680px"
      />
    </div>
  );
}
