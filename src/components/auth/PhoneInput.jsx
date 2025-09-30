import React, { useState, useEffect } from "react";
import { countryCodes } from "@/utils/countryCodes";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { Label } from "../ui/label";

const PhoneInput = React.forwardRef(({ 
  value = "", 
  onChange, 
  id, 
  label, 
  placeholder = "Número de telefone",
  className,
  required = false,
  disabled = false,
  description
}, ref) => {
  const [selectedCode, setSelectedCode] = useState(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (value) {
      const foundCode = countryCodes.find(code => 
        value.startsWith(code.code)
      ) || countryCodes[0];
      
      setSelectedCode(foundCode);
      setPhoneNumber(value.replace(foundCode.code, ''));
    }
  }, [value]);

  const handlePhoneChange = (e) => {
    const number = e.target.value.replace(/\D/g, '');
    setPhoneNumber(number);
    onChange?.(`${selectedCode.code}${number}`);
  };

  const handleCodeChange = (code) => {
    const newCode = countryCodes.find(c => c.code === code);
    setSelectedCode(newCode);
    onChange?.(`${newCode.code}${phoneNumber}`);
  };

  // Função para formatar o número baseado no país selecionado
  const formatPhoneNumber = (number) => {
    if (!number) return "";
    
    if (selectedCode.code === "+258") {
      return number.replace(/(\d{2})(\d{3})(\d{0,3})/, "$1 $2 $3");
    }
    
    // Para outros países, retorna o número limpo
    return number;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}{required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="flex gap-2">
        {/* Select de código do país com bandeira */}
        <Select 
          value={selectedCode.code} 
          onValueChange={handleCodeChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[140px] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCode.flag}</span>
                <span className="text-sm">{selectedCode.code}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[400px] overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
            {countryCodes.map((country) => (
              <SelectItem 
                key={country.code} 
                value={country.code}
                className="flex items-center gap-3 py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <span className="text-lg flex-shrink-0">{country.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {country.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {country.code}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Input do número de telefone */}
        <Input
          ref={ref}
          type="tel"
          id={id}
          value={formatPhoneNumber(phoneNumber)}
          onChange={handlePhoneChange}
          placeholder={selectedCode.code === "+258" ? "84 123 4567" :
            placeholder}
          className={`flex-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          required={required}
          disabled={disabled}
        />
      </div>
      
      {/* Texto descritivo */}
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
});

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };