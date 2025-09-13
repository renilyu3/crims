import React from "react";

interface FormLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  showCard?: boolean;
}

const FormLayout: React.FC<FormLayoutProps> = ({
  children,
  title,
  subtitle,
  maxWidth = "md",
  showCard = true,
}) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case "sm":
        return "max-width-sm";
      case "md":
        return "max-width-md";
      case "lg":
        return "max-width-lg";
      case "xl":
        return "max-width-xl";
      default:
        return "max-width-md";
    }
  };

  const content = (
    <>
      {(title || subtitle) && (
        <div className="form-header">
          {title && <h2 className="form-title">{title}</h2>}
          {subtitle && <p className="form-subtitle">{subtitle}</p>}
        </div>
      )}
      <div className="form-content">{children}</div>
    </>
  );

  return (
    <div className={`form-layout ${getMaxWidthClass()}`}>
      {showCard ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">{content}</div>
        </div>
      ) : (
        content
      )}
    </div>
  );
};

export default FormLayout;
