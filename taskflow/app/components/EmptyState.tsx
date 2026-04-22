import React, { FC } from "react";
import Image from "next/image";

interface EmptyStateProps {
  imageSrc?: string;
  imageAlt?: string;
  message?: string;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: FC<EmptyStateProps> = ({
  imageSrc,
  imageAlt,
  message,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="my-40 w-full h-full flex justify-center items-center flex-col">
      {imageSrc && (
        <Image
          src={imageSrc}
          alt={imageAlt || ""}
          height={500}
          width={500}
          className="w-40 h-40"
        />
      )}
      {message && <p className="text-sm text-gray-500 mt-2">{message}</p>}
      {title && <h2 className="text-xl font-semibold mt-4">{title}</h2>}
      {description && (
        <p className="text-sm text-gray-500 mt-2 text-center max-w-md">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
