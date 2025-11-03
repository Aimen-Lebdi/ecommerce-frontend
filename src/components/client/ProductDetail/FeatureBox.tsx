import { CheckCircle } from "lucide-react";

const features = [
  "One Year Warranty",
  "Free Shipping & Fast Delivery",
  "100% Money-back Guarantee",
  "24/7 Customer Support",
  "Secure Payment Method"
];

const FeatureBox = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4 text-sm">
      <h3 className="font-semibold text-blue">Why Buy From Us?</h3>
      <ul className="space-y-2">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-secondary">
            <CheckCircle size={16} className="text-green-500 mt-1" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeatureBox;
