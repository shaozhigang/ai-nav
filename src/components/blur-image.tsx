"use client";

import clsx from "clsx";
import Image from "next/image";
import React, { useState } from "react";

interface IBlurImage {
  height?: any;
  width?: any;
  src?: string | any;
  objectFit?: any;
  className?: string | any;
  alt?: string | undefined;
  [x: string]: any;
}

export const BlurImage = ({
  height,
  width,
  src,
  className,
  objectFit,
  alt,
  ...rest
}: IBlurImage) => {
  const [isLoading, setLoading] = useState(true);
  // 判断是否为远程图片
  const isRemoteImage = typeof src === 'string' && src.startsWith('http');

  return (
    <Image
      className={clsx(
        "transition duration-300 transform",
        isLoading ? "blur-sm scale-105" : "blur-0 scale-100",
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      blurDataURL={isRemoteImage ? undefined : src}
      alt={alt ? alt : "Avatar"}
      unoptimized={isRemoteImage}
      {...rest}
    />
  );
};
