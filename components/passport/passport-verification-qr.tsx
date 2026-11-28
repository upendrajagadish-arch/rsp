"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function PassportVerificationQR({
  url,
  size = 120,
}: {
  url: string;
  size?: number;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(url, {
      width: size * 2,
      margin: 1,
      color: { dark: "#08182D", light: "#FFFEFA" },
    }).then((d) => {
      if (!cancelled) setDataUrl(d);
    });
    return () => {
      cancelled = true;
    };
  }, [url, size]);

  if (!dataUrl) {
    return (
      <div
        className="flex items-center justify-center border border-[#D8C398] bg-[#FFFEFA] text-[10px] text-[#78828E]"
        style={{ width: size, height: size }}
      >
        QR
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Passport verification QR code"
      width={size}
      height={size}
      className="border border-[#D8C398] bg-[#FFFEFA]"
    />
  );
}
