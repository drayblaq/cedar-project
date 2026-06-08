"use client";

import PhoneInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import "react-phone-number-input/style.css";
import { useState } from "react";

interface Props {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  label?: string;
}

export function PhoneInputField({ name, value, onChange, required, placeholder, label }: Props) {
  const [phone, setPhone] = useState(value || "");

  function handleChange(val: string | undefined) {
    const v = val || "";
    setPhone(v);
    onChange?.(v);
  }

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="phone-input-wrapper">
        <PhoneInput
          flags={flags}
          international
          defaultCountry="BJ"
          value={phone}
          onChange={handleChange}
          placeholder={placeholder || "Phone number"}
        />
        <input type="hidden" name={name} value={phone} />
      </div>
    </div>
  );
}
