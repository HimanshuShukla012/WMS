// src/components/Modal.tsx
import { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

const Modal = ({ children, onClose }: ModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-100 bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
