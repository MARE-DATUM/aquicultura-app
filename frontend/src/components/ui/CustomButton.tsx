import React from 'react';
import { Button, ButtonProps } from './Button';

interface CustomButtonProps extends ButtonProps {
  icon?: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  icon,
  children,
  className,
  ...props
}) => {
  return (
    <Button className={className} {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
};

export default CustomButton;

