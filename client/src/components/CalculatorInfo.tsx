import { Info, AlertCircle, FileText } from "lucide-react";

interface CalculatorInfoProps {
  description?: string;
  useCase?: string;
  assumptions?: string[];
}

export default function CalculatorInfo({ description, useCase, assumptions }: CalculatorInfoProps) {
  if (!description && !useCase && !assumptions?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Description */}
      {description && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-blue-900">About This Calculator</h3>
          </div>
          <p className="text-sm text-blue-800">{description}</p>
        </div>
      )}

      {/* Use Case */}
      {useCase && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold text-green-900">Real-World Use</h3>
          </div>
          <p className="text-sm text-green-800">{useCase}</p>
        </div>
      )}

      {/* Assumptions */}
      {assumptions && assumptions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Assumptions</h3>
          </div>
          <ul className="text-sm text-amber-800 space-y-1">
            {assumptions.map((assumption, index) => (
              <li key={index} className="flex items-start space-x-1">
                <span className="text-amber-600 mt-0.5">•</span>
                <span>{assumption}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}