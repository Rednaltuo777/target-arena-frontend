import { useEffect, useMemo, useState } from "react";
import "../App.css";

export default function BackgroundRotator() {
  const images = useMemo(
    () => [
      "/rotator/slide-1.jpg",
      "/rotator/slide-2.jpg",
      "/rotator/slide-3.jpg",
      "/rotator/slide-4.jpg",
      "/rotator/slide-5.jpg",
    ],
    []
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 7000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="bg-rotator" aria-hidden="true">
      {images.map((src, index) => (
        <div
          key={src}
          className={index === activeIndex ? "bg-slide active" : "bg-slide"}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <div className="bg-overlay" />
    </div>
  );
}
